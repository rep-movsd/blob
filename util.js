function randomize()
{
    var d = new Date();
    var n = d.getTime() | 0;
    n = n % 255;
    for(var i = 0; i < n; ++i)
    {
        var x = Math.random();
    }
}


function randomDelta(x)
{
    return x * (Math.random() - 0.5);
}


function random(start, stop, offset)
{
    if(!offset) offset = 0;
    var range = (stop - start) - (offset * 2);
    return start + offset + Math.random() * range;
}


// Returns a smoothly varying random number within the range [-range, range]
// It will vary by a max  of +/- variance

function TRand(range, variance)
{
    randomize();
    this.range = range;
    this.variance = variance;
    this.val = randomDelta(range);
}


TRand.prototype =
{
    val : 0,
    variance : 0,

    update : function()
    {
        this.val += randomDelta(this.variance);
        if (this.val < -this.variance) this.val = -this.variance;
        if (this.val > this.variance) this.val = this.variance;
    }
}


function sqr(x) { return x * x; }

// Get least distance from a line vw to a point p
// Todo, return dist squared to avoid sqrt?
function linePointDist(v, w, p)
{
    // Get vectors of w and p relative to v as origin
    // then scale w0 to p0's length
    var w0 = w.minus(v);
    var p0 = p.minus(v);
    var len = p0.len();
    var lenw = w0.len();

    if(len > lenw)
    {
        return g_w;
    }

    w0.unitize().scale(len);

    //dp = w0 . p0;
    //prod = len * len;
    //cosTheta = dp / prod;
    //alt = len * cosTheta;
    // simplify
    // alt = (len * dp) / (len * len)
    // alt = dp / len

    // Get the altitude using above simplification
    var alt = w0.getDot(p0) / len;

    // Restrict collision to line segment rather than line
    // Negative altitude means the angle is obtuse
    if(alt < 0)
        return g_w;

    // Return base of the triangle using pythogoras
    return Math.sqrt(sqr(len) - sqr(alt));
}


function loadBlobImgFrames(path, count)
{
    var loaded = 0;
    g_arrBlobImgs.push([]);
    var index = g_arrBlobImgs.length - 1;
    for(var i = 0; i < count; ++i)
    {
        var img = new Image();
        g_arrBlobImgs[index].push(img);
        img.src = path + i + '.png';
    }
}
