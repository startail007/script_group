Number.prototype.CropNumber = function(pMin, pMax) {
    return Math.max(pMin, Math.min(this, pMax));
};
