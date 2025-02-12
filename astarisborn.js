// Class to represent each cell in our grid
class AStarNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.gCost = Infinity;  // Cost from start to this node (actual path cost)
        this.hCost = 0;        // Heuristic cost: estimated cost from this node to goal
        this.fCost = Infinity;  // Total estimated cost (f = g + h)
        this.parent = null;    // Reference to previous node (used to reconstruct path)
    }

    // Updates all costs for this node
    updateCosts(gCost, goal) {
        this.gCost = gCost;
        this.hCost = heuristic(this, goal);  // Calculate estimated cost to goal
        this.fCost = this.gCost + this.hCost;  // Update total cost
    }

    // Creates a unique string identifier for this node's position
    getKey() {
        return `${this.x},${this.y}`;
    }
}

// Manhattan distance heuristic: estimates cost between two points
// by calculating total horizontal and vertical distance
export function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export default function aStar(startPos, goalPos, grid) {
    // Convert our simple grid points into AStarNodes
    // Store them in a Map for quick lookup by position
    const nodes = new Map(
        grid.map(point => {
            const node = new AStarNode(point.x, point.y);
            return [node.getKey(), node];
        })
    );

    // Get start and goal nodes from our nodes Map
    const start = nodes.get(`${startPos.x},${startPos.y}`);
    const goal = nodes.get(`${goalPos.x},${goalPos.y}`);
    console.log(start.getKey())
    console.log(goal.getKey())

    // Initialize start node with 0 cost since we're starting here
    start.updateCosts(0, goal);
    
    // openSet: nodes to be evaluated
    let openSet = [start];
    // closedSet: nodes we've already evaluated
    const closedSet = new Set();

    // Main loop: continue while there are nodes to evaluate
    while (openSet.length > 0) {
        // Find the node in openSet with lowest fCost
        // If there's a tie in fCost, choose the one with lower hCost
        const current = openSet.reduce((a, b) => 
            a.fCost < b.fCost ? a : 
            a.fCost === b.fCost ? (a.hCost < b.hCost ? a : b) : b
        );

        // If we've reached the goal, we're done!
        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(current);
        }

        // Move current node from open to closed set
        openSet = openSet.filter(node => node !== current);
        closedSet.add(current.getKey());

        // Get all valid neighbors of current node
        const neighbors = getNeighbors(current, nodes);

        // Evaluate each neighbor
        for (const neighbor of neighbors) {
            // Skip if we've already evaluated this neighbor
            if (closedSet.has(neighbor.getKey())) {
                continue;
            }

            // Calculate potential cost to reach neighbor through current node
            const tentativeGCost = current.gCost + heuristic(current, neighbor);

            // If we found a better path to this neighbor
            if (tentativeGCost < neighbor.gCost) {
                // Update neighbor's parent and costs
                neighbor.parent = current;
                neighbor.updateCosts(tentativeGCost, goal);

                // Add to openSet if not already there
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // If we get here, no path was found
    return null;
}

// Gets valid neighboring nodes in the four cardinal directions
function getNeighbors(node, nodesMap) {
    // Define the four possible directions: right, left, down, up
    const directions = [
        {x: 1, y: 0}, {x: -1, y: 0},
        {x: 0, y: 1}, {x: 0, y: -1}
    ];

    // Create and filter neighbors
    return directions
        .map(dir => {
            const key = `${node.x + dir.x},${node.y + dir.y}`;
            return nodesMap.get(key);
        })
        .filter(neighbor => neighbor !== undefined);  // Only return valid neighbors
}

// Reconstructs the path from goal to start using parent references
function reconstructPath(endNode) {
    const path = [];
    let current = endNode;
    
    // Follow parent references back to start
    while (current !== null) {
        path.push(current);
        current = current.parent;
    }
    
    // Reverse to get path from start to goal
    return path.reverse();
}