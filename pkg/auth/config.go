package auth

type Config struct {
	Secret   string `yaml:"secret"`
	APIKey   string `yaml:"apiKey"`
	AdminKey string `yaml:"adminKey"`
}
