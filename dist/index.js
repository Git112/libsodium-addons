'use strict';

var libsodium = require('libsodium-sumo');
var tools = require('./tools');

module.exports = {
    crypto_stream_chacha20_xor(input_message, nonce, key, outputFormat) {
        var address_pool = [];
        tools._check_output_format(outputFormat);

        // ---------- input: input_message (unsized_buf)

        input_message = tools._any_to_Uint8Array(address_pool, input_message, "input_message");
        var input_message_address = tools._to_allocated_buf_address(input_message),
            input_message_length = input_message.length;
        address_pool.push(input_message_address);

        // ---------- input: nonce (buf)

        nonce = tools._any_to_Uint8Array(address_pool, nonce, "nonce");
        var nonce_address, nonce_length = (libsodium._crypto_stream_chacha20_noncebytes()) | 0;
        if (nonce.length !== nonce_length) {
             tools._free_and_throw_type_error(address_pool, "invalid nonce length");
        }
        nonce_address = tools._to_allocated_buf_address(nonce);
        address_pool.push(nonce_address);

        // ---------- input: key (buf)

        key = tools._any_to_Uint8Array(address_pool, key, "key");
        var key_address, key_length = (libsodium._crypto_stream_chacha20_keybytes()) | 0;
        if (key.length !== key_length) {
             tools._free_and_throw_type_error(address_pool, "invalid key length");
        }
        key_address = tools._to_allocated_buf_address(key);
        address_pool.push(key_address);

        // ---------- output output_message (buf)

        var output_message_length = (input_message_length) | 0,
            output_message = new tools.AllocatedBuf(output_message_length),
            output_message_address = output_message.address;

        address_pool.push(output_message_address);

        if ((libsodium._crypto_stream_chacha20_xor(output_message_address, input_message_address, input_message_length, 0, nonce_address, key_address)) === 0) {
             var ret = tools._format_output(output_message, outputFormat);
             tools._free_all(address_pool);
             return ret;
        }
        tools._free_and_throw_error(address_pool);
    }
};
