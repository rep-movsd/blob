
// "Constructor" function for the TXy class
function Txy(ix, iy)
{
    this.x = ix;
    this.y = iy;
}
//////////////////////////////////////////////////////////////////////////////

function getRandomXY(scale)
{
    return new Txy(randomDelta(scale), randomDelta(scale));
}

// 3d co ord class, positive Z is out of the screen, X is right, Y is up
Txy.prototype =
{
    x: 0.0,
    y: 0.0,

    // Arithmetic mutating functions, return this to allow chaining
    inc: function(v)
    {
        this.x += v.x;
        this.y += v.y;
        return this;
    },

    dec: function(v)
    {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },

    scale: function(n)
    {
        this.x *= n;
        this.y *= n;
        return this;
    },

    invert: function()
    {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },

    unitize: function()
    {
        var len = this.len();
        this.x /= len;
        this.y /= len;
        return this;
    },

    ///////////////////////////////////////////////////////////////////////////
    // Non mutating functions
    ///////////////////////////////////////////////////////////////////////////

    plus: function(that)
    {
        return this.makeClone().inc(that);
    },

    minus: function(that)
    {
        return this.makeClone().dec(that);
    },

    times: function(n)
    {
        return this.makeClone().scale(n);
    },

    // dot product
    getDot: function(v)
    {
        return this.x * v.x + this.y * v.y;
    },

    // Duplicate a vector
    makeClone: function()
    {
        return new Txy(this.x, this.y);
    },

    // create normal vector
    makeNormal: function()
    {
        var len = this.len();
        var vn = new Txy(-this.y/len, this.x/len);
        return vn;
    },

    // Magnitude
    len: function()
    {
        return Math.sqrt(this.getDot(this));
    },

    // Distance to another point
    dist: function(that)
    {
        return this.minus(that).len();
    }

};
//////////////////////////////////////////////////////////////////////////////


