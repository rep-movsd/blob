
//////////////////////////////////////////////////////////////////////////////
// Link class link between two blobs
//////////////////////////////////////////////////////////////////////////////

function TLink(id1, id2)
{
    randomize();
    this.id1 = id1;
    this.id2 = id2;
    this.color = 'orange';
    this.thickness = 3;
    this.jagged = 4;

    // Smooth random variable
    this.rng = new TRand(1, 0.1);
}

TLink.prototype =
{
    draw: function()
    {
        g_ctx.strokeStyle = 'orange';
        var thickness = this.thickness;
        if(g_arrBlobLoop && ! g_bLinkDestroy)
        {
            g_ctx.strokeStyle = 'green'
            g_ctx.shadowColor = 'green';
            g_ctx.lineWidth = 2;
            this.jagged = 3;
            thickness = 1;
        }
        else
        {
            g_ctx.shadowColor = 'red';
            g_ctx.lineWidth = 1;
        }

        if(g_bLinkDestroy)
        {
            this.jagged+=0.2;
            g_ctx.strokeStyle = 'red'
        }

        for(var i = 0; i < thickness; ++i)
        {
            this.drawStrand();
        }
    },


    drawStrand: function()
    {
        var x1 = g_arrBlobs[this.id1].p.x;
        var y1 = g_arrBlobs[this.id1].p.y;
        var x2 = g_arrBlobs[this.id2].p.x;
        var y2 = g_arrBlobs[this.id2].p.y;

        var nSteps = 50;
        var nWaves = 1.5;
        var dx = (x2 - x1) / nSteps;
        var dy = (y2 - y1) / nSteps;


        g_ctx.beginPath();
        g_ctx.moveTo(x1, y1);

        // orthogonal directions
        var ddx = -dy * (g_arrBlobLoop ? 0.5 : 1.5);
        var ddy = dx * (g_arrBlobLoop ? 0.5 : 1.5);

        var x = x1, y = y1, xn, yn, rx, ry;
        var dTheta = (nWaves * 2 * Math.PI) / nSteps;
        var theta = this.rng.val * 2 + (g_nFrameNo * 2 * Math.PI) / 50;
        var sinTheta;

        // Draw a sine wave along the line
        for(var i = 0; i < nSteps; ++i)
        {
            xn = x + dx;
            yn = y + dy;

            sinTheta = Math.sin(theta);
            theta += dTheta;
            rx = Math.random() * this.jagged;
            ry = Math.random() * this.jagged;

            g_ctx.lineTo(rx + xn + sinTheta * ddx, ry + yn + sinTheta * ddy);

            x = xn;
            y = yn;
        }

        g_ctx.lineTo(x2, y2);
        g_ctx.stroke();

        if(g_nFrameNo % 50 == 0)
        {
            this.rng.update();
        }
    }
}

// Find a given link given 2 blob ids
function findLink(id1, id2)
{
    for(var i = 0; i < g_arrLinks.length; ++i)
    {
        var link = g_arrLinks[i];
        if( (id1 == link.id1 && id2 == link.id2) ||
            (id1 == link.id2 && id2 == link.id1))
        {
            return i;
        }
    }
    return -1;
}


// Get number of links given blob id has
function countBlobLinks(blobID)
{
    var n = 0;
    for(var i = 0; i < g_arrLinks.length; ++i)
    {
        var link = g_arrLinks[i];
        if(blobID == link.id1 || blobID == link.id2)
        {
            ++n;
        }
    }
    return n;
}


// Closed loop detection - closed loops have all blobs with 2 or 0 links

function detectLoop()
{
    var counts = {}, ret = [];
    for(var i = 0; i < g_arrBlobs.length; ++i)
    {
        counts[g_arrBlobs[i].id] = 0;
    }

    for(var i = 0; i < g_arrLinks.length; ++i)
    {
        var link = g_arrLinks[i];
        counts[link.id1]++;
        counts[link.id2]++;
    }

    for(var i in counts)
    {
        if(counts[i] == 1)
        {
            return null;
        }
        else if(counts[i] == 2)
        {
            ret.push(i);
        }
    }

    if(!ret.length) ret = null;

    return ret;
}
