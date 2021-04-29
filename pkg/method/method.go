package method

import (
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type Lang string

const (
	LangPython3 Lang = "python3"
)

type Program struct {
	Lang Lang   `json:"lang"`
	Code string `json:"code"`
}

type Method struct {
	config  *Config
	methods map[string]Program
}

func NewMethod(config *Config) *Method {
	return &Method{
		config:  config,
		methods: map[string]Program{},
	}
}

func (m *Method) checkAPIKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("humbase-method-api-key")
		if token == m.config.APIKey {
			ctx.Next()
		} else {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error": "bad humbase-method-api-key",
			})
			ctx.Abort()
		}
	}
}

func (m *Method) checkAdminKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("humbase-method-admin-key")
		if token == m.config.AdminKey {
			ctx.Next()
		} else {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error": "bad humbase-method-admin-key",
			})
			ctx.Abort()
		}
	}
}

func (m *Method) RegisterRoutes(router *gin.RouterGroup) {
	admin := router.Group("method")
	admin.Use(m.checkAdminKey())
	{
		admin.GET("", m.findAll)
		admin.POST("", m.put)
		admin.DELETE(":name", m.del)
	}

	method := router.Group("method")
	method.Use(m.checkAPIKey())
	{
		method.POST(":name", m.run)
	}
}

func (m *Method) findAll(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"methods": m.methods,
	})
}

type putRequest struct {
	Name    string  `json:"name"`
	Program Program `json:"program"`
}

func (m *Method) put(ctx *gin.Context) {
	req := putRequest{}
	if err := ctx.Bind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	m.methods[req.Name] = req.Program

	ctx.JSON(http.StatusCreated, gin.H{})
}

func (m *Method) del(ctx *gin.Context) {
	name := ctx.Param("name")

	if name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "bad request",
		})
		return
	}

	delete(m.methods, name)
}

func (m *Method) run(ctx *gin.Context) {
	name := ctx.Param("name")

	program, ok := m.methods[name]
	if !ok {
		ctx.JSON(http.StatusNotFound, gin.H{})
		return
	}

	switch program.Lang {
	case LangPython3:
		body, err := ctx.GetRawData()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, err)
			return
		}

		res, err := m.runPython3(program.Code, string(body))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, err)
			return
		}

		r := strings.NewReader(res)
		ctx.Status(http.StatusOK)
		ctx.Writer.Header().Set("Content-Type", "application/json")
		io.Copy(ctx.Writer, r)
		return
	}
}

func (m *Method) runPython3(code, body string) (string, error) {
	pythonCommand := "python3 -c \"`cat <<EOF\n" + code + "\nEOF`\""
	cmd := exec.Command("bash", "-c", pythonCommand)
	cmd.Env = append(os.Environ(), "BODY="+body)
	out, err := cmd.CombinedOutput()
	return string(out), err
}
