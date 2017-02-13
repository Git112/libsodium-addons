'use strict';

const addons = require('../dist/index');

describe('CompatibilitySpec',  () => {

  const toTypedArray = (array) => {
    const arrayBuffer = new ArrayBuffer(array.length);
    const typedArray = new Uint8Array(arrayBuffer);

    for (let i = 0, length = array.length; i < length; i++) {
      typedArray[i] = array[i];
    }

    return typedArray;
  }

  describe('crypto_stream_chacha20_xor', () => {
    it('combines plaintext digits with a cipher digit stream (keystream).',  () => {
      const message = 'Hello';

      const nonce = [0, 1, 2, 3, 4, 5, 6, 7];
      const nonceBuffer = new ArrayBuffer(nonce.length);
      const typedNonce = new Uint8Array(nonceBuffer);

      const keyMaterial = [5, 30, 208, 218, 140, 173, 89, 133, 238, 120, 243, 172, 56, 0, 84, 80, 225, 83, 110, 68, 59, 136, 105, 202, 200, 243, 73, 174, 28, 38, 66, 246];
      const keyMaterialBuffer = new ArrayBuffer(keyMaterial.length);
      const typedKeyMaterial = new Uint8Array(keyMaterialBuffer);

      const actual = addons.crypto_stream_chacha20_xor(message, typedNonce, typedKeyMaterial, 'uint8array');
      const expected = toTypedArray([62, 221, 140, 193, 207]);

      expect(actual).toEqual(expected);
    });
  });

});
