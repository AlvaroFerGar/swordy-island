export function checkIntersection(x, y, x1, y1, x2, y2) {
    // First check: Is the point's Y coordinate between the edge's Y coordinates?
    const isPointBetweenEdgeY = ((y1 > y) !== (y2 > y));
    if (!isPointBetweenEdgeY) {
        return false;
    }
    
    // If yes, calculate the X intersection point
    // This is the X coordinate where the horizontal line from our point
    // intersects with the edge
    
    // Calculate slope-related component
    const slope = (x2 - x1) / (y2 - y1);
    
    // Calculate X intersection point
    const xIntersect = slope * (y - y1) + x1;
    
    // Check if our point's X coordinate is before this intersection
    return x < xIntersect;
}



export function isPointInPolygon(point, polygon) {
    // point is [x, y]
    // polygon is array of [x, y] points
    //https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
    const x = point.x;
    const y = point.z;//As z is 

    let inside = false;
    
    // Loop through all edges of the polygon
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {

        const xi = polygon[i][0];
        const yi = polygon[i][1];
        const xj = polygon[j][0];
        const yj = polygon[j][1];
        
    
        // Check if ray from point crosses this edge
        const intersect = checkIntersection(x,y,xi,yi,xj,yj);
        
        if (intersect)
          inside = !inside; //If the number of intersections is odd, the point is inside; if even, it's outside
    }
    
    return inside;
}

export function createGrid(polygon, spacing) {
    let grid = [];

    if (!polygon || polygon.length === 0) {
        throw new Error("El polígono está vacío o no es válido.");
    }
    let minX = Math.min(...polygon.map(p => p[0]));
    let maxX = Math.max(...polygon.map(p => p[0]));
    let minY = Math.min(...polygon.map(p => p[1]));
    let maxY = Math.max(...polygon.map(p => p[1]));

console.log(minX)
console.log(maxX)
console.log(minY)
console.log(maxY)

minX=-100
maxX=100
minY=-100
maxY=100

    for (let x = minX; x <= maxX; x += spacing) {
        for (let y = minY; y <= maxY; y += spacing) {
            if (isPointInPolygon({x: x, z: y}, polygon)) {
                grid.push({x: x, y: y});
        }
    }
    }
    return grid;
}