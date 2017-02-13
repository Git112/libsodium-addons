'use strict';

const libsodium = require('libsodium-wrappers');
const addons = require('../dist/index');

const ietf_vectors = [{
  k: '0000000000000000000000000000000000000000000000000000000000000000',
  n: '0000000000000000',
  m: '76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669'
}, {
  k: '0000000000000000000000000000000000000000000000000000000000000001',
  n: '0000000000000000',
  m: '4540f05a9f1fb296d7736e7b208e3c96eb4fe1834688d2604f450952ed432d41bbe2a0b6ea7566d2a5d1e7e20d42af2c53d792b1c43fea817e9ad275'
}, {
  k: '0000000000000000000000000000000000000000000000000000000000000000',
  n: '0000000000000001',
  m: 'de9cba7bf3d69ef5e786dc63973f653a0b49e015adbff7134fcb7df137821031e85a050278a7084527214f73efc7fa5b5277062eb7a0433e445f41e3'
}, {
  k: '0000000000000000000000000000000000000000000000000000000000000000',
  n: '0100000000000000',
  m: 'ef3fdfd6c61578fbf5cf35bd3dd33b8009631634d21e42ac33960bd138e50d32111e4caf237ee53ca8ad6426194a88545ddc497a0b466e7d6bbdb004'
}, {
  k: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
  n: '0001020304050607',
  m: 'f798a189f195e66982105ffb640bb7757f579da31602fc93ec01ac56f85ac3c134a4547b733b46413042c9440049176905d3be59ea1c53f15916155c2be8241a38008b9a26bc35941e2444177c8ade6689de95264986d95889fb60e84629c9bd9a5acb1cc118be563eb9b3a4a472f82e09a7e778492b562ef7130e88dfe031c79db9d4f7c7a899151b9a475032b63fc385245fe054e3dd5a97a5f576fe064025d3ce042c566ab2c507b138db853e3d6959660996546cc9c4a6eafdc777c040d70eaf46f76dad3979e5c5360c3317166a1c894c94a371876a94df7628fe4e'
}];

describe('IETF ChaCha20 test vectors', () => {
  it('encrypts plaintext to ciphertext', () => {
    const encrypt_plain_text = (vector) => {
      const plaintext = new Uint8Array(vector.m.length >> 1);
      const nonce = libsodium.from_hex(vector.n);
      const key = new Uint8Array(libsodium.from_hex(vector.k));
      const ciphertext = addons.crypto_stream_chacha20_xor(plaintext, nonce, key, 'uint8array');

      return ciphertext;
    };

    ietf_vectors.forEach((vector) => {
      const ciphertext = encrypt_plain_text(vector);
      expect(libsodium.to_hex(ciphertext)).toEqual(vector.m);
    });
  });

  it('decrypts ciphertext to plaintext', () => {
    const decrypt_cipher_text = (vector) => {
      const plaintext = new Uint8Array(vector.m.length >> 1);
      const nonce = libsodium.from_hex(vector.n);
      const key = new Uint8Array(libsodium.from_hex(vector.k));

      const ciphertext = addons.crypto_stream_chacha20_xor(plaintext, nonce, key, 'uint8array');

      return {
        key: key,
        ciphertext: ciphertext,
        nonce: nonce,
        plaintext: plaintext
      };
    };

    ietf_vectors.forEach((vector) => {
      const result = decrypt_cipher_text(vector);
      expect(libsodium.to_hex(result.ciphertext)).toEqual(vector.m);
      expect(addons.crypto_stream_chacha20_xor(result.ciphertext, result.nonce, result.key, 'uint8array')).toEqual(result.plaintext);
    });
  });
});
