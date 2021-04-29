package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ophum/humbase/pkg/auth"
	"github.com/ophum/humbase/pkg/store"
	"gopkg.in/yaml.v2"
)

type Config struct {
	ListenAddress string       `yaml:"listenAddress"`
	ListenPort    int          `yaml:"listenPort"`
	AuthConfig    auth.Config  `yaml:"auth"`
	StoreConfig   store.Config `yaml:"store"`
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

	v0 := r.Group("api/v0")
	{
		a := auth.NewAuth(&config.AuthConfig)
		s := store.NewStore(&config.StoreConfig)

		a.RegisterRoutes(v0)
		s.RegisterRoutes(v0)
	}

	r.Run(fmt.Sprintf("%s:%d", config.ListenAddress, config.ListenPort))
}
