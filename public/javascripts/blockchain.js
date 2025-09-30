/////////////////////////
// global variable setup
/////////////////////////

// number of zeros required at front of hash
var difficultyMajor = 4;

// 0-15, maximum (decimal) value of the hex digit after the front
// 15 means any hex character is allowed next
// 7  means next bit must be 0 (because 0x7=0111),
//    (so the bit-strength is doubled)
// 0  means only 0x0 can be next
//    (equivalent to one more difficultyMajor)
var difficultyMinor = 15;  

var maximumNonce = 8;  // limit the nonce so we don't mine too long
var pattern = '';
for (var x=0; x<difficultyMajor; x++) {
  pattern += '0';     // every additional required 0
  maximumNonce *= 16; // takes 16x longer to mine
}
// at this point in the setup, difficultyMajor=4
// yields pattern '0000' and maximumNonce 8*16^4=524288

// add one more hex-char for the minor difficulty
pattern += difficultyMinor.toString(16);
var patternLen = pattern.length; // == difficultyMajor+1

if      (difficultyMinor == 0) { maximumNonce *= 16; } // 0000 require 4 more 0 bits
else if (difficultyMinor == 1) { maximumNonce *= 8;  } // 0001 require 3 more 0 bits
else if (difficultyMinor <= 3) { maximumNonce *= 4;  } // 0011 require 2 more 0 bits
else if (difficultyMinor <= 7) { maximumNonce *= 2;  } // 0111 require 1 more 0 bit
// else don't bother increasing maximumNonce, it already started with 8x padding



/////////////////////////
// functions
/////////////////////////
function sha256(block, chain) {
  // calculate a SHA256 hash of the contents of the block
  return CryptoJS.SHA256(getText(block, chain));
}

function updateState(block, chain) {
  // set the well background red or green for this block
  var well = $('#block'+block+'chain'+chain+'well');
  var hashInput = $('#block'+block+'chain'+chain+'hash');
  if (hashInput.val().substr(0, patternLen) <= pattern) {
      well.removeClass('well-error').addClass('well-success');
      hashInput.animate({backgroundColor: '#d4edda'}, 300);
  }
  else {
      well.removeClass('well-success').addClass('well-error');
      hashInput.animate({backgroundColor: '#f8d7da'}, 300);
  }
}

function updateHash(block, chain) {
  // update the SHA256 hash value for this block
  $('#block'+block+'chain'+chain+'hash').val(sha256(block, chain));
  updateState(block, chain);
}

function updateChain(block, chain) {
  // update all blocks walking the chain from this block to the end
  for (var x = block; x <= 5; x++) {
    if (x > 1) {
      $('#block'+x+'chain'+chain+'previous').val($('#block'+(x-1).toString()+'chain'+chain+'hash').val());
    }
    updateHash(x, chain);
  }
}

function mine(block, chain, isChain) {
  var nonceInput = $('#block'+block+'chain'+chain+'nonce');
  var hashInput = $('#block'+block+'chain'+chain+'hash');
  var well = $('#block'+block+'chain'+chain+'well');

  well.addClass('mining');
  hashInput.css('background-color', '#fff3cd');

  for (var x = 0; x <= maximumNonce; x++) {
    nonceInput.val(x);
    var currentHash = sha256(block, chain);
    hashInput.val(currentHash);

    if (currentHash.substr(0, patternLen) <= pattern) {
      if (isChain) {
        updateChain(block, chain);
      }
      else {
        updateState(block, chain);
      }
      well.removeClass('mining');
      hashInput.animate({backgroundColor: '#d4edda'}, 500);
      break;
    }
  }

  if (!well.hasClass('well-success')) {
    well.removeClass('mining');
    hashInput.animate({backgroundColor: '#f8d7da'}, 500);
  }
}

// Initialize tooltips on document ready
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
