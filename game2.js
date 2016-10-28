function init()
{
    // Load animation frames
    //loadBlobImgFrames('./img/throb', 10)
    loadBlobImgFrames('./blob0', 1)
    loadBlobImgFrames('./blob1', 1)
    loadBlobImgFrames('./blob2', 1)

    loadBlobImgFrames('./img/clay', 20)
    loadBlobImgFrames('./img/dust', 20)

    var timerID = setInterval
    (
        function()
        {
            for(var i = 0; i < g_arrBlobImgs.length; ++i)
            {
                if(!g_arrBlobImgs[i].length)
                {
                    return;
                }
            }

            clearTimeout(timerID);
            startGame();
        },
        1000
    );
}


function onMouseDown(evt)
{
    var xy = new Txy(evt.pageX, g_h - evt.pageY);
    var n = g_arrBlobs.length;
    for(var i = 0; i < n; ++i)
    {
        g_arrBlobs[i].handleClick(xy);
    }
}


function startGame()
{
    var elmCanvas = document.getElementById('theCanvas');
    elmCanvas.addEventListener("mousedown", onMouseDown, false);
    g_ctxScreen = elmCanvas.getContext('2d');
    g_w = g_ctxScreen.canvas.clientWidth;
    g_h = g_ctxScreen.canvas.clientHeight;

    g_ctxScreen.setTransform(1, 0, 0, -1, 0, g_h);

    g_canvasBK = document.createElement('canvas');
    g_canvasBK.width = g_w;
    g_canvasBK.height = g_h;

    g_ctx = g_canvasBK.getContext('2d');
    g_ctx.strokeStyle = "#FFFFFF";
    g_ctx.fillStyle = "#000000";

    var n = 5;
    for(var i = 0; i < n; ++i)
        addRandomBlob();

    setInterval(animate, g_deltaT * 1000);
}

// Draw an array of objects
function drawEach(objs)
{
    objs.forEach(function(obj){obj.draw()});
}


// Check links and blobs for collision
function checkLinkBlobCollisions()
{
    var n = g_arrBlobs.length;

    // For each link
    g_arrLinks.forEach
    (
        function(link)
        {
            // Check each blob thats not part of this link
            for(var i = 0; i < n; ++i)
            {
                if(i != link.id1 && i != link.id2)
                {
                    var blob = g_arrBlobs[i];
                    var v = g_arrBlobs[link.id1].p;
                    var w = g_arrBlobs[link.id2].p;
                    var dist = linePointDist(v, w, blob.p);
                    if(dist <= blob.radius())
                    {
                        if(!g_arrBlobLoop)
                        {
                            schedDestroyLinks();
                        }

                        return;
                    }
                }
            }
        }
    );

}

// Handle blob to blob collisions
function handleBlobsCollision()
{
    var n = g_arrBlobs.length;

    for(var i = 0; i < n; ++i)
    {
        for(var j = i + 1; j < n; ++j)
        {
            g_arrBlobs[i].testCollideAndBounce(g_arrBlobs[j]);
        }
    }
}


// Bouncing blobs off the walls
function handleWallBlobCollision()
{
    g_arrBlobs.forEach
    (
        function(blob)
        {
            var l = blob.radius(), r = g_w - l;
            var b = l, t = g_h - b;

            if(blob.p.x < l)
            {
                blob.bounce(new Txy(0, -1), 1.0);
                blob.p.x = l;
            }
            else if(blob.p.x > r)
            {
                blob.bounce(new Txy(0, 1), 1.0);
                blob.p.x = r;
            }

            if(blob.p.y < b)
            {
                blob.bounce(new Txy(1, 0), 1.1);
                blob.p.y = b;
            }
            else if(blob.p.y > t)
            {
                blob.bounce(new Txy(-1, 0), 1.0);
                blob.p.y = t;
            }
        }
    );
}


// Draw animation frame
function animate()
{
    g_ctx.fillStyle = "#000000";
    g_ctx.fillRect(0, 0, g_w, g_h);

    drawEach(g_arrLinks);
    drawEach(g_arrBlobs);
    checkLinkBlobCollisions();

    // calculate N times, but draw only once, improves collision accuracy
    var n = g_arrBlobs.length;
    for(var xx = 0; xx < g_nUpdatesPerFrame; ++xx)
    {
        handleBlobsCollision();
        handleWallBlobCollision();

        // Update all positions
        g_arrBlobs.forEach(function(blob){blob.update()});
    }

    // Double buffered
    g_ctxScreen.drawImage(g_canvasBK, 0, 0);

    g_nFrameNo++;
}
