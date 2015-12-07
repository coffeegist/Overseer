function Node(ip) {
    this._x = 0;
    this._y = 0;
    this._ip = ip;
}

function getIP() {
    return this._ip;
}

function getX() {
    return this._x;
}

function getY() {
    return this._y;
}

function setX(x) {
    this._x = x;
}

function setY(y) {
    this._y = y;
}

/*
displayTraffic
Purpose: Display traffic from one point to another
Parameters: Data - structured as follows...
  {dest_ip, src_port, dst_port}
*/
function displayTraffic(data) {
  shootLaser(this._x, this._y);
}

Node.prototype.getIP = getIP();
Node.prototype.getX = getX();
Node.prototype.getY = getY();
Node.prototype.setX = setX();
Node.prototype.setY = setY();
