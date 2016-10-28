// Incrementing ID for the blobs
var g_iBlobLastID = 0;

// Blobs and links
var g_arrBlobs = [];
var g_arrLinks = [];

//  blob images, each entry is an array of 1 or more images (animation frames)
var g_arrBlobImgs = [];

// 20 frames second
var g_deltaT = 1.0 / 30;

// Graphics context and dimensions
var g_canvasBK;
var g_ctx, g_ctxScreen;
var g_w;
var g_h;

// Current animation frame
var g_nFrameNo = 0;

// How many times to calculate before drawing
var g_nUpdatesPerFrame = 5;

var g_LastClickedBlobID = -1;

var g_clickNum = 0;

var g_bLinkDestroy = false;

var g_arrBlobLoop = null;
