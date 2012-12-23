server:
	open http://localhost:8080/
	dev_appserver.py .

deploy:
	appcfg.py update .

coffee:
	coffee -wc static/app.coffee
