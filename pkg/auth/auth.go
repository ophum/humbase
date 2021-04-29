package auth

import (
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type Auth struct {
	config        *Config
	users         []EmailAndPassword
	invalidTokens map[string]bool
}

func NewAuth(config *Config) *Auth {
	return &Auth{
		config:        config,
		users:         []EmailAndPassword{},
		invalidTokens: map[string]bool{},
	}
}

func (a *Auth) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("sign-up", a.signUp)
		auth.POST("sign-in", a.signIn)
		auth.DELETE("sign-out", a.signOut)
		auth.POST("verify", a.verifyJWT)
	}
}

func (a *Auth) signUp(ctx *gin.Context) {
	req := emailAndPasswordRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	if a.isExistsEmail(req.Email) {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "email is exists",
		})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate password hash.",
		})
		return
	}

	a.users = append(a.users, EmailAndPassword{
		Email:    req.Email,
		Password: hashed,
	})

	t, err := a.generateToken(req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate jwt token.",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token": t,
	})
}

func (a *Auth) signIn(ctx *gin.Context) {
	req := emailAndPasswordRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	user := &EmailAndPassword{}
	for _, u := range a.users {
		if u.Email == req.Email {
			user = &u
			break
		}
	}

	if user == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(req.Password)); err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	t, err := a.generateToken(req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate jwt token.",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token": t,
	})
}

func (a *Auth) signOut(ctx *gin.Context) {
	req := verifyJWTRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
			"msg":   err.Error(),
		})
		return
	}

	a.invalidTokens[req.Token] = true
	ctx.JSON(http.StatusOK, gin.H{})
}

func (a *Auth) verifyJWT(ctx *gin.Context) {
	req := verifyJWTRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
			"msg":   err.Error(),
		})
		return
	}

	if invalid, ok := a.invalidTokens[req.Token]; ok && invalid {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	token, err := jwt.Parse(string(req.Token), func(token *jwt.Token) (interface{}, error) {
		return []byte(a.config.Secret), nil
	})
	if token.Valid {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "valid",
		})
	} else if ve, ok := err.(*jwt.ValidationError); ok {
		ctx.JSON(http.StatusBadRequest, ve)
	} else {
		ctx.JSON(http.StatusBadRequest, err)
	}
}
