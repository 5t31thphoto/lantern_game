/* Reserved local adapter seam for Muse 2 browser/BLE integration. The game accepts normalized local signals; no cloud service is required. */
window.LanternMuse={version:1,frame(q,s){window.dispatchEvent(new CustomEvent('lantern-muse',{detail:{quality:q,steadiness:s}}));}};
