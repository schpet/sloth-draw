server:
	open http://localhost:8080/
	dev_appserver.py .

deploy:
	appcfg.py update .

coffee:
	coffee -wc static/*.coffee static/spec/*.coffee

about:
	markdown about-copy.md > about-copy.html
