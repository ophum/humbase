package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ophum/humbase/pkg/auth"
	"github.com/ophum/humbase/pkg/method"
	"github.com/ophum/humbase/pkg/store"
	"gopkg.in/yaml.v2"

	"github.com/gin-contrib/cors"
)

type Config struct {
	ListenAddress string        `yaml:"listenAddress"`
	ListenPort    int           `yaml:"listenPort"`
	AuthConfig    auth.Config   `yaml:"auth"`
	StoreConfig   store.Config  `yaml:"store"`
	MethodConfig  method.Config `yaml:"method"`
}

var (
	configFilePath string
	config         Config
)

func init() {
	flag.StringVar(&configFilePath, "config", "config.yaml", "config file path")
	flag.Parse()

	f, err := os.Open(configFilePath)
	if err != nil {
		log.Fatal(err.Error())
		return
	}
	defer f.Close()

	if err := yaml.NewDecoder(f).Decode(&config); err != nil {
		f.Close()
		log.Fatal(err.Error())
	}
}
func main() {
	r := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AllowHeaders = append(corsConfig.AllowHeaders, "*")
	r.Use(cors.New(corsConfig))
	v0 := r.Group("api/v0")
	{
		a := auth.NewAuth(&config.AuthConfig)
		s := store.NewStore(&config.StoreConfig)
		m := method.NewMethod(&config.MethodConfig)

		a.RegisterRoutes(v0)
		s.RegisterRoutes(v0)
		m.RegisterRoutes(v0)
	}

	r.Run(fmt.Sprintf("%s:%d", config.ListenAddress, config.ListenPort))
}
