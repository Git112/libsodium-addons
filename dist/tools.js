'use strict';

var libsodium = require('libsodium-sumo');

var tools = {
    _any_to_Uint8Array: function (address_pool, varValue, varName) {
        tools._require_defined(address_pool, varValue, varName);
        if (varValue instanceof Uint8Array) {
            return varValue;
        } else if (typeof varValue === "string") {
            return tools.from_string(varValue);
        }
        tools._free_and_throw_type_error(address_pool, "unsupported input type for " + varName);
    },

    //---------------------------------------------------------------------------
    // Memory management
    //
    // AllocatedBuf: address allocated using _malloc() + length
    AllocatedBuf: function (length) {
        this.length = length;
        this.address = tools._malloc(length);
    },

    _check_output_format: function (format) {
        if (!format) {
            return;
        } else if (typeof format !== "string") {
            throw new TypeError("When defined, the output format must be a string");
        } else if (!tools._is_output_format(format)) {
            throw new Error(format + " is not a supported output format");
        }
    },

    _format_output: function (output, optionalOutputFormat) {
        var selectedOutputFormat = optionalOutputFormat || output_format;
        if (!tools._is_output_format(selectedOutputFormat)) {
            throw new Error(selectedOutputFormat + " output format is not available");
        }
        if (output instanceof tools.AllocatedBuf) {
            if (selectedOutputFormat === "uint8array") {
                return output.to_Uint8Array();
            } else if (selectedOutputFormat === "text") {
                return tools.to_string(output.to_Uint8Array());
            } else if (selectedOutputFormat === "hex") {
                return tools.to_hex(output.to_Uint8Array());
            } else if (selectedOutputFormat === "base64") {
                return tools.to_base64(output.to_Uint8Array());
            } else {
                throw new Error("What is output format \"" + selectedOutputFormat + "\"?");
            }
        } else if (typeof output === "object") { //Composed output. Example : key pairs
            var props = Object.keys(output);
            var formattedOutput = {};
            for (var i = 0; i < props.length; i++) {
                formattedOutput[props[i]] = tools._format_output(output[props[i]], selectedOutputFormat);
            }
            return formattedOutput;
        } else if (typeof output === "string") {
            return output;
        } else {
            throw new TypeError("Cannot format output");
        }
    },

    _is_output_format: function (format) {
        var formats = tools.output_formats();
        for (var i = 0; i < formats.length; i++) {
            if (formats[i] === format) {
                return true;
            }
        }
        return false;
    },

    // _malloc() a region and initialize it with the content of a Uint8Array
    _to_allocated_buf_address: function (bytes) {
        var address = tools._malloc(bytes.length);
        libsodium.HEAPU8.set(bytes, address);
        return address;
    },

    _malloc: function (length) {
        var result = libsodium._malloc(length);
        if (result === 0) {
            throw {
                message: "_malloc() failed",
                length: length
            };
        }
        return result;
    },

    from_string: function (str) {
        if (typeof TextEncoder === "function") {
            return new TextEncoder("utf-8").encode(str);
        }
        str = unescape(encodeURIComponent(str));
        var bytes = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    },

    _free_all: function (addresses) {
        for (var i = 0; i < addresses.length; i++) {
            libsodium._free(addresses[i]);
        }
    },

    _free_and_throw_error: function (address_pool, err) {
        tools._free_all(address_pool);
        throw new Error(err);
    },

    _free_and_throw_type_error: function (address_pool, err) {
        tools._free_all(address_pool);
        throw new TypeError(err);
    },

    _require_defined: function (address_pool, varValue, varName) {
        if (varValue == undefined) {
            tools._free_and_throw_type_error(address_pool, varName + " cannot be null or undefined");
        }
    },

    output_formats: function () {
        return ["uint8array", "text", "hex", "base64"];
    }
};

tools.AllocatedBuf.prototype.to_Uint8Array = function (length) {
    var result = new Uint8Array(this.length);
    result.set(libsodium.HEAPU8.subarray(this.address, this.address + this.length));
    return result;
};

module.exports = tools;
