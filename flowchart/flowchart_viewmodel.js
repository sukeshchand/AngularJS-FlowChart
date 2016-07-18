
//
// Global accessor.
//
var flowchart = {

};

//
// Width of a node.
//
flowchart.defaultNodeWidth = 250;
flowchart.defaultNodeHeight = 120;
flowchart.defaultNodeDirection = "Vertical";
flowchart.defaultCanvasMinWidth = "100%";
flowchart.defaultCanvasMinHeight = "100%";
flowchart.defaultNodeFillStyle = "url(#nodeBackgroundGradient1)";

//
// Amount of space reserved for displaying the node's name.
//
flowchart.nodeNameHeight = 40;

//
// Height of a connector in a node.
//
flowchart.connectorHeight = 30;
flowchart.connectorWidth = 30;

//
// Compute the Y coordinate of a connector, given its index.
//
flowchart.computeConnectorY = function (connectorIndex, nodeHeight) {
    var connectorHeight = (connectorIndex * flowchart.connectorHeight);
    var connectorY = (nodeHeight / 2) - (connectorHeight / 2);
    return flowchart.nodeNameHeight + connectorY;
}

flowchart.computeConnectorX = function (connectorLength, connectorIndex, nodeWidth) {
    var connectorWidth = flowchart.connectorWidth;
    var connectorX = ((nodeWidth / 2) - ((connectorWidth * (connectorLength + 1) / 2)) + (connectorWidth * (connectorIndex + 1)));
    return connectorX;

}

//
// Compute the position of a connector in the graph.
//
flowchart.computeConnectorPos = function (node, connectorIndex, inputConnector) {
    // happens when click on node to made the connection
    if (node.data.NodeDirection === "Vertical") {
        return {
            x: node.x() + flowchart.computeConnectorX((inputConnector ? node.inputConnectors.length : node.outputConnectors.length), connectorIndex, node.width()),
            y: node.y() + (inputConnector ? 0 : node.height ? node.height() : flowchart.defaultNodeHeight)
        };
    } else {
        return {
            x: node.x() + (inputConnector ? 0 : node.width ? node.width() : flowchart.defaultNodeWidth),
            y: node.y() + flowchart.computeConnectorY(connectorIndex, node.height())
        };

    }
};

//
// View model for a connector.
//
flowchart.ConnectorViewModel = function (connectorDataModel, x, y, parentNode) {

    this.data = connectorDataModel;
    this._parentNode = parentNode;
    this._x = x;
    this._y = y;

    //
    // The name of the connector.
    //
    this.name = function () {
        return this.data.name;
    }

    //
    // X coordinate of the connector.
    //
    this.x = function () {
        return this._x;
    };

    //
    // Y coordinate of the connector.
    //
    this.y = function () {
        return this._y;
    };

    //
    // The parent node that the connector is attached to.
    //
    this.parentNode = function () {
        return this._parentNode;
    };
};

//
// Create view model for a list of data models.
//
var createConnectorsViewModel = function (inputConnector, connectorDataModels, x, y, parentNode) {
    var viewModels = [];
    if (connectorDataModels) {
        var nodeHeight = parentNode.data.height ? parentNode.data.height : flowchart.defaultNodeHeight;
        var nodeWidth = parentNode.data.width ? parentNode.data.width : flowchart.defaultNodeWidth;
        for (var i = 0; i < connectorDataModels.length; ++i) {
            var connectorViewModel = {};
            if (parentNode.data.NodeDirection === "Vertical") {
                connectorViewModel =
                    new flowchart.ConnectorViewModel(connectorDataModels[i], flowchart.computeConnectorX(inputConnector ? parentNode.data.inputConnectors.length : parentNode.data.outputConnectors.length, i, nodeWidth), y, parentNode);

            } else {
                connectorViewModel =
                    new flowchart.ConnectorViewModel(connectorDataModels[i], x, flowchart.computeConnectorY(i, nodeHeight), parentNode);
            }
            viewModels.push(connectorViewModel);
        }
    }
    return viewModels;
};

//
// View model for a node.
//
flowchart.NodeViewModel = function (nodeDataModel) {

    this.data = nodeDataModel;

    // set the default width & height value of the node
    if (!this.data.width || this.data.width < 0) {
        this.data.width = flowchart.defaultNodeWidth;
    }
    if (!this.data.height || this.data.height < 0) {
        this.data.height = flowchart.defaultNodeHeight;
    }
    this.inputConnectors = createConnectorsViewModel(true, this.data.inputConnectors, 0, 0, this);
    this.outputConnectors = createConnectorsViewModel(false, this.data.outputConnectors, this.data.width, this.data.height, this);

    // Set to true when the node is selected.
    this._selected = false;

    //
    // Name of the node.
    //
    this.name = function () {
        return this.data.name || "";
    };

    //
    // X coordinate of the node.
    //
    this.x = function () {
        return this.data.x;
    };

    //
    // Y coordinate of the node.
    //
    this.y = function () {
        return this.data.y;
    };

    //
    // Width of the node.
    //
    this.width = function () {
        if (this.data.height) {
            return this.data.width;
        } else {
            return flowchart.defaultNodeWidth;
        }
    }

    this.height = function () {
        if (this.data.height) {
            return this.data.height;
        } else {
            return flowchart.defaultNodeHeight;
        }
    }

    this.fillStyle = function () {
        if (this.data.fillStyle) {
            return this.data.fillStyle;
        } else {
            return flowchart.defaultNodeFillStyle;
        }
    }

    //
    // Select the node.
    //
    this.select = function () {
        this._selected = true;
    };

    //
    // Deselect the node.
    //
    this.deselect = function () {
        this._selected = false;
    };

    //
    // Toggle the selection state of the node.
    //
    this.toggleSelected = function () {
        this._selected = !this._selected;
    };

    //
    // Returns true if the node is selected.
    //
    this.selected = function () {
        return this._selected;
    };

    //
    // Internal function to add a connector.
    this._addConnector = function (inputConnector, connectorDataModel, connectorsDataModel) {
        connectorsDataModel.push(connectorDataModel);
        if (inputConnector) {
            this.inputConnectors = createConnectorsViewModel(true, connectorsDataModel, 0, 0, this);
        } else {
            this.outputConnectors = createConnectorsViewModel(false, connectorsDataModel, this.data.width, this.data.height, this);
        }
        this.connections = [];
    }

    //
    // Add an input connector to the node.
    //
    this.addInputConnector = function (connectorDataModel) {

        if (!this.data.inputConnectors) {
            this.data.inputConnectors = [];
        }
        this._addConnector(true, connectorDataModel, this.data.inputConnectors);
    };

    //
    // Add an ouput connector to the node.
    //
    this.addOutputConnector = function (connectorDataModel) {

        if (!this.data.outputConnectors) {
            this.data.outputConnectors = [];
        }
        this._addConnector(false, connectorDataModel, this.data.outputConnectors);
    };
};

// 
// Wrap the nodes data-model in a view-model.
//
var createNodesViewModel = function (nodesDataModel) {
    var nodesViewModel = [];
    if (nodesDataModel) {
        for (var i = 0; i < nodesDataModel.length; ++i) {
            nodesViewModel.push(new flowchart.NodeViewModel(nodesDataModel[i]));
        }
    }
    return nodesViewModel;
};

//
// View model for a connection.
//
flowchart.ConnectionViewModel = function (connectionDataModel, sourceConnector, destConnector) {

    this.data = connectionDataModel;
    this.source = sourceConnector;
    this.dest = destConnector;

    // Set to true when the connection is selected.
    this._selected = false;

    this.name = function () {
        return this.data.name || "";
    }

    this.sourceCoordX = function () {
        return this.source.parentNode().x() + this.source.x();
    };

    this.sourceCoordY = function () {
        return this.source.parentNode().y() + this.source.y();
    };

    this.sourceCoord = function () {
        return {
            x: this.sourceCoordX(),
            y: this.sourceCoordY()
        };
    }

    this.sourceTangentX = function () {
        return flowchart.computeConnectionSourceTangentX(this.sourceCoord(), this.destCoord()); 
    };

    this.sourceTangentY = function () {
        return flowchart.computeConnectionSourceTangentY(this.sourceCoord(), this.destCoord());
    };

    this.destCoordX = function () {
        return this.dest.parentNode().x() + this.dest.x();
    };

    this.destCoordY = function () {
        return this.dest.parentNode().y() + this.dest.y();
    };

    this.destCoord = function () {
        return {
            x: this.destCoordX(),
            y: this.destCoordY()
        };
    }

    this.destTangentX = function () {
        return flowchart.computeConnectionDestTangentX(this.sourceCoord(), this.destCoord());
    };

    this.destTangentY = function () {
        return flowchart.computeConnectionDestTangentY(this.sourceCoord(), this.destCoord());
    };

    this.middleX = function (scale) {
        if (typeof (scale) == "undefined")
            scale = 0.5;
        return this.sourceCoordX() * (1 - scale) + this.destCoordX() * scale;
    };

    this.middleY = function (scale) {
        if (typeof (scale) == "undefined")
            scale = 0.5;
        return this.sourceCoordY() * (1 - scale) + this.destCoordY() * scale;
    };
    //
    // Select the connection.
    //
    this.select = function () {
        this._selected = true;
    };

    //
    // Deselect the connection.
    //
    this.deselect = function () {
        this._selected = false;
    };

    //
    // Toggle the selection state of the connection.
    //
    this.toggleSelected = function () {
        this._selected = !this._selected;
    };

    //
    // Returns true if the connection is selected.
    //
    this.selected = function () {
        return this._selected;
    };
};

//
// Helper function.
//
var computeConnectionTangentOffset = function (pt1, pt2) {

    return ((pt2.x - pt1.x) / 2);
}

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionSourceTangentX = function (pt1, pt2) {

    return pt1.x + computeConnectionTangentOffset(pt1, pt2);
};

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionSourceTangentY = function (pt1, pt2) {
    return pt1.y;
};

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionSourceTangent = function (pt1, pt2) {
    return {
        x: flowchart.computeConnectionSourceTangentX(pt1, pt2),
        y: flowchart.computeConnectionSourceTangentY(pt1, pt2),
    };
};

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionDestTangentX = function (pt1, pt2) {
    return pt2.x - computeConnectionTangentOffset(pt1, pt2);
};

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionDestTangentY = function (pt1, pt2) {
    return pt2.y;
};

//
// Compute the tangent for the bezier curve.
//
flowchart.computeConnectionDestTangent = function (pt1, pt2) {
    return {
        x: flowchart.computeConnectionDestTangentX(pt1, pt2),
        y: flowchart.computeConnectionDestTangentY(pt1, pt2),
    };
};

//
// View model for the chart.
//
flowchart.ChartViewModel = function (chartDataModel) {

    //
    // Get Next node Id
    //
    this.GetNextNodeId = function () {
        var maxId = 0;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].data.id > maxId) {
                maxId = this.nodes[i].data.id;
            }
        }
        return maxId;
    }
 
    this.updateCanvasSize = function () {
        var tmpCanvasHeight = 0;
        var tmpCanvasWidth = 0;
        for (var i = 0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            var nodeWidth = node.data.x + node.data.width + 50;
            var nodeHeight = node.data.y + node.data.height + 50;
            if (nodeWidth > tmpCanvasWidth) {
                tmpCanvasWidth = nodeWidth;
            }
            if (nodeHeight > tmpCanvasHeight) {
                tmpCanvasHeight = nodeHeight;
            }
        }
        this.canvasHeight = tmpCanvasHeight + "px";
        this.canvasWidth = tmpCanvasWidth + "px";
    };

    this.canvasMinHeight = function () {
        if (this.data.canvasMinHeight) {
            return this.data.canvasMinHeight;
        } else {
            return flowchart.defaultCanvasMinHeight;
        }
    };

    this.canvasMinWidth = function () {
        if (this.data.canvasMinWidth) {
            return this.data.canvasMinWidth;
        } else {
            return flowchart.defaultCanvasMinWidth;
        }
    };

    //
    // Find a specific node within the chart.
    //
    this.findNode = function (nodeID) {

        for (var i = 0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            if (node.data.id == nodeID) {
                return node;
            }
        }

        throw new Error("Failed to find node " + nodeID);
    };

    //
    // Find a specific input connector within the chart.
    //
    this.findInputConnector = function (nodeID, connectorIndex) {

        var node = this.findNode(nodeID);

        if (!node.inputConnectors || node.inputConnectors.length <= connectorIndex) {
            throw new Error("Node " + nodeID + " has invalid input connectors.");
        }

        return node.inputConnectors[connectorIndex];
    };

    //
    // Find a specific output connector within the chart.
    //
    this.findOutputConnector = function (nodeID, connectorIndex) {

        var node = this.findNode(nodeID);

        if (!node.outputConnectors || node.outputConnectors.length <= connectorIndex) {
            throw new Error("Node " + nodeID + " has invalid output connectors.");
        }

        return node.outputConnectors[connectorIndex];
    };

    //
    // Create a view model for connection from the data model.
    //
    this._createConnectionViewModel = function (connectionDataModel) {

        var sourceConnector = this.findOutputConnector(connectionDataModel.source.nodeID, connectionDataModel.source.connectorIndex);
        var destConnector = this.findInputConnector(connectionDataModel.dest.nodeID, connectionDataModel.dest.connectorIndex);
        return new flowchart.ConnectionViewModel(connectionDataModel, sourceConnector, destConnector);
    }

    // 
    // Wrap the connections data-model in a view-model.
    //
    this._createConnectionsViewModel = function (connectionsDataModel) {

        var connectionsViewModel = [];

        if (connectionsDataModel) {
            for (var i = 0; i < connectionsDataModel.length; ++i) {
                connectionsViewModel.push(this._createConnectionViewModel(connectionsDataModel[i]));
            }
        }

        return connectionsViewModel;
    };

    // Reference to the underlying data.
    this.data = chartDataModel;

    // Create a view-model for nodes.
    this.nodes = createNodesViewModel(this.data.nodes);

    this.updateCanvasSize();

    this.refreshConnections = function () {
        this.connections = this._createConnectionsViewModel(this.data.connections);
    }

    // Create a view-model for connections.
    this.refreshConnections();

    //
    // Create a view model for a new connection.
    //
    this.createNewConnection = function (startConnector, endConnector) {

        var connectionsDataModel = this.data.connections;
        if (!connectionsDataModel) {
            connectionsDataModel = this.data.connections = [];
        }

        var connectionsViewModel = this.connections;
        if (!connectionsViewModel) {
            connectionsViewModel = this.connections = [];
        }

        var startNode = startConnector.parentNode();
        var startConnectorIndex = startNode.outputConnectors.indexOf(startConnector);
        var startConnectorType = 'output';
        if (startConnectorIndex == -1) {
            startConnectorIndex = startNode.inputConnectors.indexOf(startConnector);
            startConnectorType = 'input';
            if (startConnectorIndex == -1) {
                throw new Error("Failed to find source connector within either inputConnectors or outputConnectors of source node.");
            }
        }

        var endNode = endConnector.parentNode();
        var endConnectorIndex = endNode.inputConnectors.indexOf(endConnector);
        var endConnectorType = 'input';
        if (endConnectorIndex == -1) {
            endConnectorIndex = endNode.outputConnectors.indexOf(endConnector);
            endConnectorType = 'output';
            if (endConnectorIndex == -1) {
                throw new Error("Failed to find dest connector within inputConnectors or outputConnectors of dest node.");
            }
        }

        if (startConnectorType == endConnectorType) {
            throw new Error("Failed to create connection. Only output to input connections are allowed.")
        }

        if (startNode == endNode) {
            throw new Error("Failed to create connection. Cannot link a node with itself.")
        }

        var startNode = {
            nodeID: startNode.data.id,
            connectorIndex: startConnectorIndex,
        }

        var endNode = {
            nodeID: endNode.data.id,
            connectorIndex: endConnectorIndex,
        }

        var connectionDataModel = {
            source: startConnectorType == 'output' ? startNode : endNode,
            dest: startConnectorType == 'output' ? endNode : startNode,
        };
        connectionsDataModel.push(connectionDataModel);

        var outputConnector = startConnectorType == 'output' ? startConnector : endConnector;
        var inputConnector = startConnectorType == 'output' ? endConnector : startConnector;

        var connectionViewModel = new flowchart.ConnectionViewModel(connectionDataModel, outputConnector, inputConnector);
        connectionsViewModel.push(connectionViewModel);
    };

    //
    // Add a node to the view model.
    //
    this.addNode = function (nodeDataModel) {
        if (!this.data.nodes) {
            this.data.nodes = [];
        }

        // 
        // Update the data model.
        //
        this.data.nodes.push(nodeDataModel);

        // 
        // Update the view model.
        //
        this.nodes.push(new flowchart.NodeViewModel(nodeDataModel));

        this.updateCanvasSize();
    }

    //
    // Select all nodes and connections in the chart.
    //
    this.selectAll = function () {

        var nodes = this.nodes;
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            node.select();
            $scope.nodesSelect(nodes);
        }

        var connections = this.connections;
        for (var i = 0; i < connections.length; ++i) {
            var connection = connections[i];
            connection.select();
        }
    }

    //
    // Deselect all nodes and connections in the chart.
    //
    this.deselectAll = function () {

        var nodes = this.nodes;
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            node.deselect();
        }

        var connections = this.connections;
        for (var i = 0; i < connections.length; ++i) {
            var connection = connections[i];
            connection.deselect();
        }
    };

    //
    // Update the location of the node and its connectors.
    //
    this.updateSelectedNodesLocation = function (deltaX, deltaY) {

        var selectedNodes = this.getSelectedNodes();

        for (var i = 0; i < selectedNodes.length; ++i) {
            var node = selectedNodes[i];
            node.data.x += deltaX;
            node.data.y += deltaY;
        }
    };

    //
    // Handle mouse click on a particular node.
    //
    this.handleNodeClicked = function (node, ctrlKey) {

        if (ctrlKey) {
            node.toggleSelected();
        }
        else {
            this.deselectAll();
            node.select();
        }

        // Move node to the end of the list so it is rendered after all the other.
        // This is the way Z-order is done in SVG.

        var nodeIndex = this.nodes.indexOf(node);
        if (nodeIndex == -1) {
            throw new Error("Failed to find node in view model!");
        }
        this.nodes.splice(nodeIndex, 1);
        this.nodes.push(node);
    };

    //
    // Handle mouse down on a connection.
    //
    this.handleConnectionMouseDown = function (connection, ctrlKey) {

        if (ctrlKey) {
            connection.toggleSelected();
        }
        else {
            this.deselectAll();
            connection.select();
        }
    };


    //
    // Delete all nodes and connections that are selected.
    //
    this.deleteSelected = function () {

        var newNodeViewModels = [];
        var newNodeDataModels = [];

        var deletedNodeIds = [];

        //
        // Sort nodes into:
        //		nodes to keep and 
        //		nodes to delete.
        //

        for (var nodeIndex = 0; nodeIndex < this.nodes.length; ++nodeIndex) {

            var node = this.nodes[nodeIndex];
            if (!node.selected()) {
                // Only retain non-selected nodes.
                newNodeViewModels.push(node);
                newNodeDataModels.push(node.data);
            }
            else {
                // Keep track of nodes that were deleted, so their connections can also
                // be deleted.
                deletedNodeIds.push(node.data.id);
            }
        }

        var newConnectionViewModels = [];
        var newConnectionDataModels = [];

        //
        // Remove connections that are selected.
        // Also remove connections for nodes that have been deleted.
        //
        for (var connectionIndex = 0; connectionIndex < this.connections.length; ++connectionIndex) {

            var connection = this.connections[connectionIndex];
            if (!connection.selected() &&
                deletedNodeIds.indexOf(connection.data.source.nodeID) === -1 &&
                deletedNodeIds.indexOf(connection.data.dest.nodeID) === -1) {
                //
                // The nodes this connection is attached to, where not deleted,
                // so keep the connection.
                //
                newConnectionViewModels.push(connection);
                newConnectionDataModels.push(connection.data);
            }
        }

        //
        // Update nodes and connections.
        //
        this.nodes = newNodeViewModels;
        this.data.nodes = newNodeDataModels;
        this.connections = newConnectionViewModels;
        this.data.connections = newConnectionDataModels;
        this.updateCanvasSize();
    };

    //
    // Select nodes and connections that fall within the selection rect.
    //
    this.applySelectionRect = function (selectionRect) {

        this.deselectAll();

        for (var i = 0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            if (node.x() >= selectionRect.x &&
                node.y() >= selectionRect.y &&
                node.x() + node.width() <= selectionRect.x + selectionRect.width &&
                node.y() + node.height() <= selectionRect.y + selectionRect.height) {
                // Select nodes that are within the selection rect.
                node.select();
            }
        }

        for (var i = 0; i < this.connections.length; ++i) {
            var connection = this.connections[i];
            if (connection.source.parentNode().selected() &&
                connection.dest.parentNode().selected()) {
                // Select the connection if both its parent nodes are selected.
                connection.select();
            }
        }

    };

    //
    // Get the array of nodes that are currently selected.
    //
    this.getSelectedNodes = function () {
        var selectedNodes = [];

        for (var i = 0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            if (node.selected()) {
                selectedNodes.push(node);
            }
        }

        return selectedNodes;
    };

    //
    // Get the array of connections that are currently selected.
    //
    this.getSelectedConnections = function () {
        var selectedConnections = [];

        for (var i = 0; i < this.connections.length; ++i) {
            var connection = this.connections[i];
            if (connection.selected()) {
                selectedConnections.push(connection);
            }
        }

        return selectedConnections;
    };
};
