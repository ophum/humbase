package auth

import (
	"time"

	"github.com/dgrijalva/jwt-go"
)

func (a *Auth) isExistsEmail(email string) bool {
	for _, user := range a.users {
		if user.Email == email {
			return true
		}
	}
	return false
}

func (a *Auth) generateToken(email string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["email"] = email
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	return token.SignedString([]byte(a.config.Secret))
}
