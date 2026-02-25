.PHONY: build run dev clean seed seed-destroy

build:
	go build -o bin/server .

run: build
	./bin/server

dev:
	go run .

seed:
	go run . seed

seed-destroy:
	go run . seed --destroy

clean:
	rm -rf bin/
