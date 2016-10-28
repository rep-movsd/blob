//////////////////////////////////////////////////////////////////////////////
// Blob class
//////////////////////////////////////////////////////////////////////////////

// Increases the blob from 0 to finalScale and then starts moving it
function materializeBlob(blob, time, finalScale, vel)
{
    var nSteps = time / g_deltaT;
    var delta = finalScale / nSteps;
    var deltaV = vel.times(1/nSteps);

    var timerID = setInterval
    (
        function()
        {
            blob.scale += delta;
            blob.v.inc(deltaV);
            if(blob.scale > finalScale)
            {
                blob.scale = finalScale;
                clearTimeout(timerID);
                blob.v = vel;
            }
        },
        g_deltaT * 1000
    );
}


function TBlob()
{
    this.p = new Txy(0, 0);      // Position
    this.v = new Txy(0, 0);      // Velocity
    this.a = new Txy(0, 0);      // Acceleration
    this.mass = 1.0;
    this.tex = 0;                // image index
    this.scale = 0.01;           // Scale to draw the object ()
    this.clicked = false;

    this.frameRand = random(0, 1000) | 0;

    this.id = g_iBlobLastID++;
}


TBlob.prototype =
{
    // Radius may change on the fly if image/scale is changed
    radius : function()
    {
        return g_arrBlobImgs[this.tex][0].naturalWidth * this.scale;
    },

    // updates the position and velocity
    update : function()
    {
        if(this.a)
        {
            this.v.inc(this.a);
            this.a = null;
        }

        // Clicked blob is slowed
        if(!g_arrBlobLoop)
        {
            if(!this.clicked)
                this.p.inc(this.v);
            else
                this.p.inc(this.v.times(0.1));
        }
    },

    // Changes the velocity based on direction of surface that bounced this
    // Only XY bounce
    bounce : function(vs)
    {
        // Get the component of vs along the normal, invert and double it
        var vn = vs.makeNormal();
        this.v.inc(vn.scale(this.v.getDot(vn) * -2));
    },

    // draw the current frame for this blob
    draw : function(ctx)
    {
        // Get the animation frame to draw
        var arrFrames = g_arrBlobImgs[this.tex];
        if (arrFrames.length)
        {
            var frameNo = (this.frameRand + g_nFrameNo) % arrFrames.length;
            var frame = arrFrames[frameNo];

            var r = this.radius();
            var x = this.p.x -r;
            var y = this.p.y -r;

            //g_ctx.strokeStyle = 'none';
            if(this.clicked)
            {
                g_ctx.shadowBlur = r * 2.5;

                g_ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                if(g_arrBlobLoop)
                {
                    g_ctx.shadowColor = 'green';
                }
                else if (g_LastClickedBlobID == this.id)
                {
                    g_ctx.shadowColor = 'red';
                }

                //g_ctx.beginPath();
                //g_ctx.ellipse(this.p.x, this.p.y, r*0.8, r * 0.8, 0, 0, Math.PI * 2);
                //g_ctx.closePath();
                //g_ctx.fill();
            }
            else
            {
                g_ctx.shadowBlur = 0;
            }

            g_ctx.drawImage(frame, x, y, r * 2, r * 2);

            var len = this.v.len();

            if(g_nFrameNo % 10 == 0 && len)
            {
                this.v.inc(getRandomXY(this.v.len()));
                this.v.unitize().scale(len);
            }
        }
    },

    // Using math from http://www.vobarian.com/collisions/2dcollisions2.pdf
    testCollideAndBounce : function(that)
    {
        var dx = this.p.x - that.p.x;
        var dy = this.p.y - that.p.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var r1 = this.radius(), r2 = that.radius();

        // Distance between centers < sum of radii means touching
        if(d < (r1 + r2))
        {
            this.draw();
            that.draw();
            var m1 = this.mass;
            var m2 = that.mass;

            // Get the collision 1d plane normal and tangent
            var norm = new Txy(-dx, -dy, 0).unitize();
            var tang = norm.makeNormal();

            // speeds of the two objects in the normal directions
            var vn1 = this.v.getDot(norm);
            var vn2 = that.v.getDot(norm);

            // Get new normal velocities
            var vndash1 = (vn1 * (m1 - m2) + 2 * m2 * vn2) / (m1 + m2);
            var vndash2 = (vn2 * (m2 - m1) + 2 * m1 * vn1) / (m1 + m2);

            // new normal velocity vectors
            var newvn1 = norm.times(vndash1);
            var newvn2 = norm.times(vndash2);

            // New tangential velocities remain same as old
            var vt1 = this.v.getDot(tang);
            var vt2 = that.v.getDot(tang);

            // make the values into a vector
            var newvt1 = tang.times(vt1);
            var newvt2 = tang.times(vt2);

            this.v = newvn1.inc(newvt1);
            that.v = newvn2.inc(newvt2);
        }
    },

    // checks for click and changes state, returns if clicked
    handleClick: function(xy)
    {
        var bLinkAdded = false;
        if(this.p.dist(xy) < this.radius())
        {
            this.clicked = !this.clicked;
            var nLinks = countBlobLinks(this.id);

            // blobs with 0 or 1 links that is not the last one can be clicked
            if((nLinks == 0 && !g_arrBlobLoop) ||
                (nLinks == 1 && this.id != g_LastClickedBlobID))
            {
                var bReset = false;
                var id1 = g_LastClickedBlobID;
                var id2 = this.id;
                if(id1 != -1 && id1 != id2)
                {
                    var id = findLink(id1, id2)
                    if(id == -1)
                    {
                        var link = new TLink(id1, id2);
                        g_arrLinks.push(link);
                        bLinkAdded = true;
                    }
                    else
                    {
                        bReset = true;
                        resetBlobs();
                    }
                }

                if(!bReset)
                    g_LastClickedBlobID = this.id;

            }
            else
            {
                schedDestroyLinks();
            }

            g_arrBlobLoop = detectLoop();
            if(bLinkAdded && g_arrBlobLoop)
            {
                this.clicked = true;
            }

            return true;
        }

        return false;
    }
}

// Adds a random blob and materializes it
function addRandomBlob()
{
    randomize();
    var blob = new TBlob();
    blob.tex = (random(0, 100) | 0) % g_arrBlobImgs.length;
    blob.p = new Txy(random(0, g_w, blob.radius()), random(0, g_h, blob.radius()));
    g_arrBlobs.push(blob);
    materializeBlob(blob, random(0.3, 3), random(0.2,0.5), getRandomXY(0.5))
}


// schedule destroying links
function schedDestroyLinks()
{
    g_bLinkDestroy = true;
    setTimeout(function(){resetBlobs();g_bLinkDestroy = false;}, 1000);
}

// Break all links, reset all blobs to unclicked state
// Also add some velocity to each blob in the direction of the links
// to simulate a springy feel
function resetBlobs()
{
    // clean blob state
    g_LastClickedBlobID = -1;
    g_arrBlobs.forEach(function(blob){blob.clicked = false;});

    g_arrLinks.forEach
    (
        function(link)
        {
            // get the two positions
            var b1 = g_arrBlobs[link.id1], b2 = g_arrBlobs[link.id2];
            var v1 = b1.p.minus(b2.p).unitize();
            var v2 = v1.times(-1);

            b1.v = b1.v.plus(v1).unitize().scale(b1.v.len() * 1.05);
            b2.v = b2.v.plus(v2).unitize().scale(b2.v.len() * 1.05);
        }
    );

    // Kill links
    g_arrLinks = [];
    g_arrBlobLoop = null;
}

