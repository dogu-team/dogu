def test_1():
    pass


def test_web(dogu_client):
    dogu_client.instance.get("http://www.google.com")


def test_web2(dogu_client):
    dogu_client.instance.get("http://www.google.com")


def test_web3(dogu_client):
    dogu_client.instance.get("http://www.google.com")
