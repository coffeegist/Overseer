function NodeManager() {
    this._nodes = [];
}

function createNode(ip) {
    var node = new Node(ip);
    this._nodes.push(node);

    return node;
}
