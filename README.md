# Overseer
Program to watch over the activities of a CTF game.

TODO
---------
Fix: Traffic does not animate from 1st element in node list to last element. 


To get this project started, you will need libpcap.

LibPCAP
---------
LibPCAP is used for sniffing the network activity, and may be obtained by issuing the following:

```
sudo apt-get install libpcap-dev
```

Upgrading NPM
---------
```
npm install -g npm
```

Install Bower and Grunt
---------
```
npm install -g bower grunt-cli
```

Setup the project
---------
```
git clone https://github.com/audrummer15/Overseer.git
cd Overseer
npm install
bower install
```

Start the Application
---------
```
sudo grunt serve
```

If this doesn't work, ensure that the grunt tool is in your path, and try the following:

```
sudo -s
grunt serve
```
