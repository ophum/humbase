package store

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/rs/xid"
)

type Store struct {
	config *Config
	db     map[string]interface{}
}

func NewStore(config *Config) *Store {
	return &Store{
		config: config,
		db:     map[string]interface{}{},
	}
}

func (s *Store) checkAPIKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("humbase-store-api-key")
		if token == s.config.APIKey {
			ctx.Next()
		} else {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error": "bad humbase-store-api-key",
			})
			ctx.Abort()
		}
	}
}
func (s *Store) RegisterRoutes(router *gin.RouterGroup) {
	store := router.Group("store")
	store.Use(s.checkAPIKey())
	{
		store.GET("", s.findAll)
		store.GET("/:id", s.findByID)
		store.POST("", s.put)
		store.DELETE("/:id", s.del)
	}
}

func (s *Store) findAll(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"data": s.db,
	})
}

func (s *Store) findByID(ctx *gin.Context) {
	id := ctx.Param("id")
	for i, d := range s.db {
		if id == i {
			ctx.JSON(http.StatusOK, gin.H{
				"data": d,
			})
			return
		}
	}
	ctx.JSON(http.StatusNotFound, gin.H{
		"data": nil,
	})
}

type putRequest struct {
	ID   string      `json:"id"`
	Data interface{} `json:"data"`
}

func (s *Store) put(ctx *gin.Context) {
	req := putRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	if req.ID == "" {
		id := xid.New()
		req.ID = id.String()
	}

	s.db[req.ID] = req.Data

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{
			req.ID: s.db[req.ID],
		},
	})
}

func (s *Store) del(ctx *gin.Context) {
	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	delete(s.db, id)

	ctx.JSON(http.StatusOK, gin.H{})
}
