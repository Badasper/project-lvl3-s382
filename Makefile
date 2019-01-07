install: 
	npm install 

start:
	npm run babel-node -- src/bin/page-loader.js https://hexlet.io/courses

publish:
	npm publish

lint:
	npm run eslint .

test:
	npm test -- --coverage

watch:
	npm test -- --watchAll

.PHONY: test install
	
