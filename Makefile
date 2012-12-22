server:
	open http://localhost:8080/
	dev_appserver.py .


deploy:
	appcfg update .
