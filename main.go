// Portfolio: One-Pager mit eingebettetem Lab.
// Der Home-Handler liest templates/lab/ aus und gibt den Baum an die Seite.
package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// labNode ist ein Ordner oder eine Datei im Lab-Baum (templates/lab/).
type labNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	Dir      bool       `json:"dir"`
	Lang     string     `json:"lang,omitempty"`
	Content  string     `json:"content,omitempty"`
	Children []*labNode `json:"children,omitempty"`
}

func labLang(name string) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".go":
		return "go"
	case ".py":
		return "python"
	case ".md":
		return "markdown"
	case ".js":
		return "javascript"
	case ".ts":
		return "typescript"
	case ".json":
		return "json"
	case ".html":
		return "html"
	case ".css":
		return "css"
	case ".sh":
		return "shell"
	case ".yml", ".yaml":
		return "yaml"
	case ".sql":
		return "sql"
	default:
		return "plaintext"
	}
}

// labReadDir liest base/rel rekursiv, Ordner zuerst, dann alphabetisch.
func labReadDir(base, rel string) ([]*labNode, error) {
	entries, err := os.ReadDir(filepath.Join(base, rel))
	if err != nil {
		return nil, err
	}
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	var nodes []*labNode
	for _, e := range entries {
		name := e.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		rp := filepath.ToSlash(filepath.Join(rel, name))
		if e.IsDir() {
			kids, err := labReadDir(base, rp)
			if err != nil {
				return nil, err
			}
			nodes = append(nodes, &labNode{Name: name, Path: rp, Dir: true, Children: kids})
			continue
		}
		data, err := os.ReadFile(filepath.Join(base, rp))
		if err != nil {
			return nil, err
		}
		nodes = append(nodes, &labNode{
			Name: name, Path: rp, Lang: labLang(name), Content: string(data),
		})
	}
	return nodes, nil
}

// home rendert den One-Pager mit dem aktuellen Lab-Baum aus templates/lab/.
func home(w http.ResponseWriter, r *http.Request) {
	tree, err := labReadDir("templates/lab", "")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	t, err := template.ParseFiles("templates/home.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// html/template kodiert den Baum im JS-Kontext sicher als JSON.
	if err := t.Execute(w, map[string]any{"Tree": tree}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	http.HandleFunc("/", home)
	http.Handle("/img/", http.StripPrefix("/img/",
		http.FileServer(http.Dir("templates/img"))))

	log.Println("Portfolio: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
