//go:build ignore

// Beispiel (verkuerzt): der One-Pager-Server hinter diesem Portfolio.
// Der Home-Handler liest templates/lab/ aus und gibt den Baum an die Seite.
package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type node struct {
	Name     string  `json:"name"`
	Path     string  `json:"path"`
	Dir      bool    `json:"dir"`
	Lang     string  `json:"lang,omitempty"`
	Content  string  `json:"content,omitempty"`
	Children []*node `json:"children,omitempty"`
}

func readDir(base, rel string) ([]*node, error) {
	entries, err := os.ReadDir(filepath.Join(base, rel))
	if err != nil {
		return nil, err
	}
	var out []*node
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), ".") {
			continue
		}
		rp := filepath.ToSlash(filepath.Join(rel, e.Name()))
		if e.IsDir() {
			kids, _ := readDir(base, rp)
			out = append(out, &node{Name: e.Name(), Path: rp, Dir: true, Children: kids})
			continue
		}
		data, _ := os.ReadFile(filepath.Join(base, rp))
		out = append(out, &node{Name: e.Name(), Path: rp, Content: string(data)})
	}
	return out, nil
}

func home(w http.ResponseWriter, r *http.Request) {
	tree, _ := readDir("templates/lab", "")
	t, _ := template.ParseFiles("templates/home.html")
	t.Execute(w, map[string]any{"Tree": tree})
}

func main() {
	http.HandleFunc("/", home)
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("templates/img"))))

	log.Println("http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
