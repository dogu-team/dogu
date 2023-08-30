/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { Struct } from '../google/protobuf/struct';

/**
 * @note To maintain the uniqueness of error codes, duplicate codes are not
 * allowed.
 */
export enum Code {
  /**
   * CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED - @note Common errors.
   * 0 ~ 999 is used for common errors.
   * 0 means success code.
   */
  CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED = 0,
  /** CODE_UNEXPECTED_ERROR - @note Unexpected error. */
  CODE_UNEXPECTED_ERROR = 1,
  /** CODE_NUMBER_UNDER_RANGE - @note Number errors. */
  CODE_NUMBER_UNDER_RANGE = 2,
  CODE_NUMBER_OVER_RANGE = 3,
  CODE_NUMBER_ZERO = 4,
  CODE_NUMBER_NULL = 5,
  /** CODE_STRING_UNDER_RANGE - @note String errors. */
  CODE_STRING_UNDER_RANGE = 10,
  CODE_STRING_OVER_RANGE = 11,
  CODE_STRING_EMPTY = 12,
  CODE_STRING_NULL = 13,
  CODE_STRING_PARSE_FAILED = 14,
  CODE_STRING_INVALID_CHARACTER = 15,
  CODE_STRING_ENCODING_FAILED = 16,
  CODE_STRING_DECODING_FAILED = 17,
  CODE_STRING_CONVERSION_FAILED = 18,
  CODE_STRING_INVALID_SYNTAX = 19,
  /** CODE_BINARY_UNDER_RANGE - @note Binary errors. */
  CODE_BINARY_UNDER_RANGE = 20,
  CODE_BINARY_OVER_RANGE = 21,
  CODE_BINARY_EMPTY = 22,
  CODE_BINARY_NULL = 23,
  CODE_BINARY_ENCODING_FAILED = 24,
  CODE_BINARY_DECODING_FAILED = 25,
  CODE_BINARY_CONVERSION_FAILED = 26,
  CODE_BINARY_VALIDATION_FAILED = 27,
  /** CODE_DATE_INVALID_YEAR - @note Date errors. */
  CODE_DATE_INVALID_YEAR = 30,
  CODE_DATE_INVALID_MONTH = 31,
  CODE_DATE_INVALID_DAY = 32,
  CODE_DATE_INVALID_HOUR = 33,
  CODE_DATE_INVALID_MINITE = 34,
  CODE_DATE_INVALID_SECOND = 35,
  /** CODE_TIME_INVALID_TIMEZONE - @note Time errors. */
  CODE_TIME_INVALID_TIMEZONE = 40,
  /** CODE_ARRAY_UNDER_RANGE - @note Array errors. */
  CODE_ARRAY_UNDER_RANGE = 50,
  CODE_ARRAY_OVER_RANGE = 51,
  CODE_ARRAY_EMPTY = 52,
  CODE_ARRAY_KEY_NOTFOUND = 53,
  /**
   * CODE_MAP_KEY_NOTFOUND - @note Map errors.
   * map means key-value storage like dictionary.
   */
  CODE_MAP_KEY_NOTFOUND = 60,
  /** CODE_CONCURRENCY_LOCK_FAILED - @note Concurrency errors. */
  CODE_CONCURRENCY_LOCK_FAILED = 70,
  CODE_CONCURRENCY_DEADLOCK = 71,
  CODE_CONCURRENCY_RACE = 72,
  /** CODE_FILESYSTEM_FILE_NOTFOUND - @note Filesystem errors. */
  CODE_FILESYSTEM_FILE_NOTFOUND = 90,
  CODE_FILESYSTEM_DIRECTORY_NOTFOUND = 91,
  CODE_FILESYSTEM_FILE_OPEN_FAILED = 92,
  CODE_FILESYSTEM_FILE_CLOSE_FAILED = 93,
  CODE_FILESYSTEM_FILE_READ_FAILED = 94,
  CODE_FILESYSTEM_FILE_WRITE_FAILED = 95,
  CODE_FILESYSTEM_DISK_FULL = 96,
  /** CODE_NETWORK_CONNECTION_FAILED - @note Network errors. */
  CODE_NETWORK_CONNECTION_FAILED = 100,
  CODE_NETWORK_CONNECTION_CLOSED = 101,
  CODE_NETWORK_CONNECTION_TIMEOUT = 102,
  CODE_NETWORK_CONNECTION_REFUSED = 103,
  CODE_NETWORK_CONNECTION_ABORTED = 104,
  CODE_NETWORK_CONNECTION_ALREADY_CONNECTED = 105,
  CODE_NETWORK_CONNECTION_INVALID_URI = 106,
  /** CODE_PROCESS_FORK_FAILED - @note Process errors. */
  CODE_PROCESS_FORK_FAILED = 110,
  CODE_PROCESS_EXEC_FAILED = 111,
  CODE_PROCESS_WAIT_FAILED = 112,
  CODE_PROCESS_KILL_FAILED = 113,
  CODE_PROCESS_SIGNAL_FAILED = 114,
  CODE_PROCESS_SIGNAL_NOT_SUPPORTED = 115,
  /** CODE_MEMORY_ALLOCATION_FAILED - @note Memory errors. */
  CODE_MEMORY_ALLOCATION_FAILED = 120,
  CODE_MEMORY_REALLOCATION_FAILED = 121,
  CODE_MEMORY_FREE_FAILED = 122,
  CODE_MEMORY_OUT_OF_MEMORY = 123,
  /** CODE_SECURITY_UNAUTHENTICATED - @note Security errors */
  CODE_SECURITY_UNAUTHENTICATED = 130,
  CODE_SECURITY_UNAUTHORISED = 131,
  CODE_SECURITY_PERMISSION_DENIED = 132,
  CODE_SECURITY_INVALID_TOKEN = 133,
  /** CODE_INPUT_NOTREADY - @note Input errors. */
  CODE_INPUT_NOTREADY = 140,
  CODE_INPUT_DISCARDED = 141,
  CODE_INPUT_UNKNOWN = 142,
  /** CODE_SCREENRECORD_NOTREADY - @note Screen record errors. */
  CODE_SCREENRECORD_NOTREADY = 150,
  CODE_SCREENRECORD_ALREADY_RECORDING = 151,
  CODE_SCREENRECORD_NOTSTARTED = 152,
  CODE_SCREENRECORD_MULTIPLE_RECORDING = 153,
  CODE_SCREENRECORD_NOTFOUND = 154,
  CODE_SCREENRECORD_NOTSUPPORTED = 155,
  /** CODE_WEBRTC_PEERCONNECTION_FAILED - @note WebRTC errors. */
  CODE_WEBRTC_PEERCONNECTION_FAILED = 160,
  CODE_WEBRTC_CODEC_NOTSUPPORTED = 161,
  /** CODE_DEVICE_NOTFOUND - @note Device errors. */
  CODE_DEVICE_NOTFOUND = 200,
  /** CODE_COMMON_END - @note Common errors end. */
  CODE_COMMON_END = 999,
  /**
   * CODE_DOST_SUCCESS_BEGIN - @note Dost errors.
   * 1000 ~ 1999 is used for dost app.
   * 1000 ~ 1255 are used for exit codes 0 ~ 255.
   * 1000 means success code.
   */
  CODE_DOST_SUCCESS_BEGIN = 1000,
  /** CODE_DOST_END - @note Dost errors end. */
  CODE_DOST_END = 1999,
  /**
   * CODE_HOST_AGENT_SUCCESS_BEGIN - @note Host Agent errors.
   * 2000 ~ 2999 is used for host agent process.
   * 2000 ~ 2255 are used for exit codes 0 ~ 255.
   * 2000 means success code.
   */
  CODE_HOST_AGENT_SUCCESS_BEGIN = 2000,
  CODE_HOST_AGENT_UNEXPECTED_ERROR = 2001,
  CODE_HOST_AGENT_INVALID_ENV = 2002,
  CODE_HOST_AGENT_PORT_IN_USE = 2003,
  /** CODE_HOST_AGENT_EXIT_CODE_END - @note reserved for host agent exit code 255. */
  CODE_HOST_AGENT_EXIT_CODE_END = 2255,
  /**
   * CODE_HOST_AGENT_SIGHUP - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGHUP = 2301,
  /**
   * CODE_HOST_AGENT_SIGINT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGINT = 2302,
  /**
   * CODE_HOST_AGENT_SIGQUIT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGQUIT = 2303,
  /**
   * CODE_HOST_AGENT_SIGILL - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGILL = 2304,
  /**
   * CODE_HOST_AGENT_SIGTRAP - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGTRAP = 2305,
  /**
   * CODE_HOST_AGENT_SIGABRT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGABRT = 2306,
  /**
   * CODE_HOST_AGENT_SIGFPE - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGFPE = 2308,
  /**
   * CODE_HOST_AGENT_SIGKILL - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGKILL = 2309,
  /**
   * CODE_HOST_AGENT_SIGSEGV - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGSEGV = 2311,
  /**
   * CODE_HOST_AGENT_SIGPIPE - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGPIPE = 2313,
  /**
   * CODE_HOST_AGENT_SIGALRM - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGALRM = 2314,
  /**
   * CODE_HOST_AGENT_SIGTERM - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_HOST_AGENT_SIGTERM = 2315,
  CODE_HOST_AGENT_DEVICE_REQUEST_FAILED = 2400,
  CODE_HOST_AGENT_INVALID_TOKEN = 2401,
  CODE_HOST_AGENT_CONNECTION_REFUSED = 2402,
  CODE_HOST_AGENT_NOT_RUNNING = 2403,
  CODE_HOST_AGENT_REQUEST_FAILED = 2404,
  /** CODE_HOST_AGENT_END - @note Host Agent errors end. */
  CODE_HOST_AGENT_END = 2999,
  /**
   * CODE_DEVICE_SERVER_SUCCESS_BEGIN - @note Device server errors.
   * 3000 ~ 3999 is used for device server process.
   * 3000 ~ 3255 are used for exit codes 0 ~ 255.
   * 3000 means success code.
   */
  CODE_DEVICE_SERVER_SUCCESS_BEGIN = 3000,
  CODE_DEVICE_SERVER_UNEXPECTED_ERROR = 3001,
  CODE_DEVICE_SERVER_INVALID_ENV = 3002,
  /**
   * CODE_DEVICE_SERVER_PORT_IN_USE - @note Device server port in use.
   * check if the port is in use by other process.
   */
  CODE_DEVICE_SERVER_PORT_IN_USE = 3003,
  /** CODE_DEVICE_SERVER_EXIT_CODE_END - @note reserved for device server exit code 255. */
  CODE_DEVICE_SERVER_EXIT_CODE_END = 3255,
  /**
   * CODE_DEVICE_SERVER_SIGHUP - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGHUP = 3301,
  /**
   * CODE_DEVICE_SERVER_SIGINT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGINT = 3302,
  /**
   * CODE_DEVICE_SERVER_SIGQUIT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGQUIT = 3303,
  /**
   * CODE_DEVICE_SERVER_SIGILL - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGILL = 3304,
  /**
   * CODE_DEVICE_SERVER_SIGTRAP - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGTRAP = 3305,
  /**
   * CODE_DEVICE_SERVER_SIGABRT - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGABRT = 3306,
  /**
   * CODE_DEVICE_SERVER_SIGFPE - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGFPE = 3308,
  /**
   * CODE_DEVICE_SERVER_SIGKILL - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGKILL = 3309,
  /**
   * CODE_DEVICE_SERVER_SIGSEGV - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGSEGV = 3311,
  /**
   * CODE_DEVICE_SERVER_SIGPIPE - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGPIPE = 3313,
  /**
   * CODE_DEVICE_SERVER_SIGALRM - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGALRM = 3314,
  /**
   * CODE_DEVICE_SERVER_SIGTERM - @link https://en.wikipedia.org/wiki/Signal_(IPC)
   * @note reserved for signal to code conversion.
   */
  CODE_DEVICE_SERVER_SIGTERM = 3315,
  CODE_DEVICE_SERVER_DEVICE_NOT_FOUND = 3400,
  CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND = 3401,
  CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND = 3402,
  CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND = 3403,
  CODE_DEVICE_SERVER_APPIUM_CAPABILITIES_NOT_FOUND = 3404,
  /** CODE_DEVICE_SERVER_END - @note Device server errors end. */
  CODE_DEVICE_SERVER_END = 3999,
  /**
   * CODE_DEVICE_CONTROLLER_BEGIN - @note Device Controller errors.
   * 4000 ~ 4999 is used for device controller.
   * 4000 means success code.
   */
  CODE_DEVICE_CONTROLLER_BEGIN = 4000,
  CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED = 4001,
  CODE_DEVICE_CONTROLLER_INPUT_PERMISSION_DENIED = 4002,
  CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN = 4003,
  /** CODE_DEVICE_CONTROLLER_END - @note Device Controller errors end. */
  CODE_DEVICE_CONTROLLER_END = 4999,
  /**
   * CODE_ANDROID_DEVICE_AGENT_BEGIN - @note Android Device Agent errors.
   * 5000 ~ 5999 is used for android device agent.
   * 5000 means success code.
   */
  CODE_ANDROID_DEVICE_AGENT_BEGIN = 5000,
  CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN = 5001,
  CODE_ANDROID_DEVICE_AGENT_CLIPBOARD_NOTAVAILABLE = 5002,
  /** CODE_ANDROID_DEVICE_AGENT_END - @note Android Device Agent errors end. */
  CODE_ANDROID_DEVICE_AGENT_END = 5999,
  UNRECOGNIZED = -1,
}

export function codeFromJSON(object: any): Code {
  switch (object) {
    case 0:
    case 'CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED':
      return Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED;
    case 1:
    case 'CODE_UNEXPECTED_ERROR':
      return Code.CODE_UNEXPECTED_ERROR;
    case 2:
    case 'CODE_NUMBER_UNDER_RANGE':
      return Code.CODE_NUMBER_UNDER_RANGE;
    case 3:
    case 'CODE_NUMBER_OVER_RANGE':
      return Code.CODE_NUMBER_OVER_RANGE;
    case 4:
    case 'CODE_NUMBER_ZERO':
      return Code.CODE_NUMBER_ZERO;
    case 5:
    case 'CODE_NUMBER_NULL':
      return Code.CODE_NUMBER_NULL;
    case 10:
    case 'CODE_STRING_UNDER_RANGE':
      return Code.CODE_STRING_UNDER_RANGE;
    case 11:
    case 'CODE_STRING_OVER_RANGE':
      return Code.CODE_STRING_OVER_RANGE;
    case 12:
    case 'CODE_STRING_EMPTY':
      return Code.CODE_STRING_EMPTY;
    case 13:
    case 'CODE_STRING_NULL':
      return Code.CODE_STRING_NULL;
    case 14:
    case 'CODE_STRING_PARSE_FAILED':
      return Code.CODE_STRING_PARSE_FAILED;
    case 15:
    case 'CODE_STRING_INVALID_CHARACTER':
      return Code.CODE_STRING_INVALID_CHARACTER;
    case 16:
    case 'CODE_STRING_ENCODING_FAILED':
      return Code.CODE_STRING_ENCODING_FAILED;
    case 17:
    case 'CODE_STRING_DECODING_FAILED':
      return Code.CODE_STRING_DECODING_FAILED;
    case 18:
    case 'CODE_STRING_CONVERSION_FAILED':
      return Code.CODE_STRING_CONVERSION_FAILED;
    case 19:
    case 'CODE_STRING_INVALID_SYNTAX':
      return Code.CODE_STRING_INVALID_SYNTAX;
    case 20:
    case 'CODE_BINARY_UNDER_RANGE':
      return Code.CODE_BINARY_UNDER_RANGE;
    case 21:
    case 'CODE_BINARY_OVER_RANGE':
      return Code.CODE_BINARY_OVER_RANGE;
    case 22:
    case 'CODE_BINARY_EMPTY':
      return Code.CODE_BINARY_EMPTY;
    case 23:
    case 'CODE_BINARY_NULL':
      return Code.CODE_BINARY_NULL;
    case 24:
    case 'CODE_BINARY_ENCODING_FAILED':
      return Code.CODE_BINARY_ENCODING_FAILED;
    case 25:
    case 'CODE_BINARY_DECODING_FAILED':
      return Code.CODE_BINARY_DECODING_FAILED;
    case 26:
    case 'CODE_BINARY_CONVERSION_FAILED':
      return Code.CODE_BINARY_CONVERSION_FAILED;
    case 27:
    case 'CODE_BINARY_VALIDATION_FAILED':
      return Code.CODE_BINARY_VALIDATION_FAILED;
    case 30:
    case 'CODE_DATE_INVALID_YEAR':
      return Code.CODE_DATE_INVALID_YEAR;
    case 31:
    case 'CODE_DATE_INVALID_MONTH':
      return Code.CODE_DATE_INVALID_MONTH;
    case 32:
    case 'CODE_DATE_INVALID_DAY':
      return Code.CODE_DATE_INVALID_DAY;
    case 33:
    case 'CODE_DATE_INVALID_HOUR':
      return Code.CODE_DATE_INVALID_HOUR;
    case 34:
    case 'CODE_DATE_INVALID_MINITE':
      return Code.CODE_DATE_INVALID_MINITE;
    case 35:
    case 'CODE_DATE_INVALID_SECOND':
      return Code.CODE_DATE_INVALID_SECOND;
    case 40:
    case 'CODE_TIME_INVALID_TIMEZONE':
      return Code.CODE_TIME_INVALID_TIMEZONE;
    case 50:
    case 'CODE_ARRAY_UNDER_RANGE':
      return Code.CODE_ARRAY_UNDER_RANGE;
    case 51:
    case 'CODE_ARRAY_OVER_RANGE':
      return Code.CODE_ARRAY_OVER_RANGE;
    case 52:
    case 'CODE_ARRAY_EMPTY':
      return Code.CODE_ARRAY_EMPTY;
    case 53:
    case 'CODE_ARRAY_KEY_NOTFOUND':
      return Code.CODE_ARRAY_KEY_NOTFOUND;
    case 60:
    case 'CODE_MAP_KEY_NOTFOUND':
      return Code.CODE_MAP_KEY_NOTFOUND;
    case 70:
    case 'CODE_CONCURRENCY_LOCK_FAILED':
      return Code.CODE_CONCURRENCY_LOCK_FAILED;
    case 71:
    case 'CODE_CONCURRENCY_DEADLOCK':
      return Code.CODE_CONCURRENCY_DEADLOCK;
    case 72:
    case 'CODE_CONCURRENCY_RACE':
      return Code.CODE_CONCURRENCY_RACE;
    case 90:
    case 'CODE_FILESYSTEM_FILE_NOTFOUND':
      return Code.CODE_FILESYSTEM_FILE_NOTFOUND;
    case 91:
    case 'CODE_FILESYSTEM_DIRECTORY_NOTFOUND':
      return Code.CODE_FILESYSTEM_DIRECTORY_NOTFOUND;
    case 92:
    case 'CODE_FILESYSTEM_FILE_OPEN_FAILED':
      return Code.CODE_FILESYSTEM_FILE_OPEN_FAILED;
    case 93:
    case 'CODE_FILESYSTEM_FILE_CLOSE_FAILED':
      return Code.CODE_FILESYSTEM_FILE_CLOSE_FAILED;
    case 94:
    case 'CODE_FILESYSTEM_FILE_READ_FAILED':
      return Code.CODE_FILESYSTEM_FILE_READ_FAILED;
    case 95:
    case 'CODE_FILESYSTEM_FILE_WRITE_FAILED':
      return Code.CODE_FILESYSTEM_FILE_WRITE_FAILED;
    case 96:
    case 'CODE_FILESYSTEM_DISK_FULL':
      return Code.CODE_FILESYSTEM_DISK_FULL;
    case 100:
    case 'CODE_NETWORK_CONNECTION_FAILED':
      return Code.CODE_NETWORK_CONNECTION_FAILED;
    case 101:
    case 'CODE_NETWORK_CONNECTION_CLOSED':
      return Code.CODE_NETWORK_CONNECTION_CLOSED;
    case 102:
    case 'CODE_NETWORK_CONNECTION_TIMEOUT':
      return Code.CODE_NETWORK_CONNECTION_TIMEOUT;
    case 103:
    case 'CODE_NETWORK_CONNECTION_REFUSED':
      return Code.CODE_NETWORK_CONNECTION_REFUSED;
    case 104:
    case 'CODE_NETWORK_CONNECTION_ABORTED':
      return Code.CODE_NETWORK_CONNECTION_ABORTED;
    case 105:
    case 'CODE_NETWORK_CONNECTION_ALREADY_CONNECTED':
      return Code.CODE_NETWORK_CONNECTION_ALREADY_CONNECTED;
    case 106:
    case 'CODE_NETWORK_CONNECTION_INVALID_URI':
      return Code.CODE_NETWORK_CONNECTION_INVALID_URI;
    case 110:
    case 'CODE_PROCESS_FORK_FAILED':
      return Code.CODE_PROCESS_FORK_FAILED;
    case 111:
    case 'CODE_PROCESS_EXEC_FAILED':
      return Code.CODE_PROCESS_EXEC_FAILED;
    case 112:
    case 'CODE_PROCESS_WAIT_FAILED':
      return Code.CODE_PROCESS_WAIT_FAILED;
    case 113:
    case 'CODE_PROCESS_KILL_FAILED':
      return Code.CODE_PROCESS_KILL_FAILED;
    case 114:
    case 'CODE_PROCESS_SIGNAL_FAILED':
      return Code.CODE_PROCESS_SIGNAL_FAILED;
    case 115:
    case 'CODE_PROCESS_SIGNAL_NOT_SUPPORTED':
      return Code.CODE_PROCESS_SIGNAL_NOT_SUPPORTED;
    case 120:
    case 'CODE_MEMORY_ALLOCATION_FAILED':
      return Code.CODE_MEMORY_ALLOCATION_FAILED;
    case 121:
    case 'CODE_MEMORY_REALLOCATION_FAILED':
      return Code.CODE_MEMORY_REALLOCATION_FAILED;
    case 122:
    case 'CODE_MEMORY_FREE_FAILED':
      return Code.CODE_MEMORY_FREE_FAILED;
    case 123:
    case 'CODE_MEMORY_OUT_OF_MEMORY':
      return Code.CODE_MEMORY_OUT_OF_MEMORY;
    case 130:
    case 'CODE_SECURITY_UNAUTHENTICATED':
      return Code.CODE_SECURITY_UNAUTHENTICATED;
    case 131:
    case 'CODE_SECURITY_UNAUTHORISED':
      return Code.CODE_SECURITY_UNAUTHORISED;
    case 132:
    case 'CODE_SECURITY_PERMISSION_DENIED':
      return Code.CODE_SECURITY_PERMISSION_DENIED;
    case 133:
    case 'CODE_SECURITY_INVALID_TOKEN':
      return Code.CODE_SECURITY_INVALID_TOKEN;
    case 140:
    case 'CODE_INPUT_NOTREADY':
      return Code.CODE_INPUT_NOTREADY;
    case 141:
    case 'CODE_INPUT_DISCARDED':
      return Code.CODE_INPUT_DISCARDED;
    case 142:
    case 'CODE_INPUT_UNKNOWN':
      return Code.CODE_INPUT_UNKNOWN;
    case 150:
    case 'CODE_SCREENRECORD_NOTREADY':
      return Code.CODE_SCREENRECORD_NOTREADY;
    case 151:
    case 'CODE_SCREENRECORD_ALREADY_RECORDING':
      return Code.CODE_SCREENRECORD_ALREADY_RECORDING;
    case 152:
    case 'CODE_SCREENRECORD_NOTSTARTED':
      return Code.CODE_SCREENRECORD_NOTSTARTED;
    case 153:
    case 'CODE_SCREENRECORD_MULTIPLE_RECORDING':
      return Code.CODE_SCREENRECORD_MULTIPLE_RECORDING;
    case 154:
    case 'CODE_SCREENRECORD_NOTFOUND':
      return Code.CODE_SCREENRECORD_NOTFOUND;
    case 155:
    case 'CODE_SCREENRECORD_NOTSUPPORTED':
      return Code.CODE_SCREENRECORD_NOTSUPPORTED;
    case 160:
    case 'CODE_WEBRTC_PEERCONNECTION_FAILED':
      return Code.CODE_WEBRTC_PEERCONNECTION_FAILED;
    case 161:
    case 'CODE_WEBRTC_CODEC_NOTSUPPORTED':
      return Code.CODE_WEBRTC_CODEC_NOTSUPPORTED;
    case 200:
    case 'CODE_DEVICE_NOTFOUND':
      return Code.CODE_DEVICE_NOTFOUND;
    case 999:
    case 'CODE_COMMON_END':
      return Code.CODE_COMMON_END;
    case 1000:
    case 'CODE_DOST_SUCCESS_BEGIN':
      return Code.CODE_DOST_SUCCESS_BEGIN;
    case 1999:
    case 'CODE_DOST_END':
      return Code.CODE_DOST_END;
    case 2000:
    case 'CODE_HOST_AGENT_SUCCESS_BEGIN':
      return Code.CODE_HOST_AGENT_SUCCESS_BEGIN;
    case 2001:
    case 'CODE_HOST_AGENT_UNEXPECTED_ERROR':
      return Code.CODE_HOST_AGENT_UNEXPECTED_ERROR;
    case 2002:
    case 'CODE_HOST_AGENT_INVALID_ENV':
      return Code.CODE_HOST_AGENT_INVALID_ENV;
    case 2003:
    case 'CODE_HOST_AGENT_PORT_IN_USE':
      return Code.CODE_HOST_AGENT_PORT_IN_USE;
    case 2255:
    case 'CODE_HOST_AGENT_EXIT_CODE_END':
      return Code.CODE_HOST_AGENT_EXIT_CODE_END;
    case 2301:
    case 'CODE_HOST_AGENT_SIGHUP':
      return Code.CODE_HOST_AGENT_SIGHUP;
    case 2302:
    case 'CODE_HOST_AGENT_SIGINT':
      return Code.CODE_HOST_AGENT_SIGINT;
    case 2303:
    case 'CODE_HOST_AGENT_SIGQUIT':
      return Code.CODE_HOST_AGENT_SIGQUIT;
    case 2304:
    case 'CODE_HOST_AGENT_SIGILL':
      return Code.CODE_HOST_AGENT_SIGILL;
    case 2305:
    case 'CODE_HOST_AGENT_SIGTRAP':
      return Code.CODE_HOST_AGENT_SIGTRAP;
    case 2306:
    case 'CODE_HOST_AGENT_SIGABRT':
      return Code.CODE_HOST_AGENT_SIGABRT;
    case 2308:
    case 'CODE_HOST_AGENT_SIGFPE':
      return Code.CODE_HOST_AGENT_SIGFPE;
    case 2309:
    case 'CODE_HOST_AGENT_SIGKILL':
      return Code.CODE_HOST_AGENT_SIGKILL;
    case 2311:
    case 'CODE_HOST_AGENT_SIGSEGV':
      return Code.CODE_HOST_AGENT_SIGSEGV;
    case 2313:
    case 'CODE_HOST_AGENT_SIGPIPE':
      return Code.CODE_HOST_AGENT_SIGPIPE;
    case 2314:
    case 'CODE_HOST_AGENT_SIGALRM':
      return Code.CODE_HOST_AGENT_SIGALRM;
    case 2315:
    case 'CODE_HOST_AGENT_SIGTERM':
      return Code.CODE_HOST_AGENT_SIGTERM;
    case 2400:
    case 'CODE_HOST_AGENT_DEVICE_REQUEST_FAILED':
      return Code.CODE_HOST_AGENT_DEVICE_REQUEST_FAILED;
    case 2401:
    case 'CODE_HOST_AGENT_INVALID_TOKEN':
      return Code.CODE_HOST_AGENT_INVALID_TOKEN;
    case 2402:
    case 'CODE_HOST_AGENT_CONNECTION_REFUSED':
      return Code.CODE_HOST_AGENT_CONNECTION_REFUSED;
    case 2403:
    case 'CODE_HOST_AGENT_NOT_RUNNING':
      return Code.CODE_HOST_AGENT_NOT_RUNNING;
    case 2404:
    case 'CODE_HOST_AGENT_REQUEST_FAILED':
      return Code.CODE_HOST_AGENT_REQUEST_FAILED;
    case 2999:
    case 'CODE_HOST_AGENT_END':
      return Code.CODE_HOST_AGENT_END;
    case 3000:
    case 'CODE_DEVICE_SERVER_SUCCESS_BEGIN':
      return Code.CODE_DEVICE_SERVER_SUCCESS_BEGIN;
    case 3001:
    case 'CODE_DEVICE_SERVER_UNEXPECTED_ERROR':
      return Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR;
    case 3002:
    case 'CODE_DEVICE_SERVER_INVALID_ENV':
      return Code.CODE_DEVICE_SERVER_INVALID_ENV;
    case 3003:
    case 'CODE_DEVICE_SERVER_PORT_IN_USE':
      return Code.CODE_DEVICE_SERVER_PORT_IN_USE;
    case 3255:
    case 'CODE_DEVICE_SERVER_EXIT_CODE_END':
      return Code.CODE_DEVICE_SERVER_EXIT_CODE_END;
    case 3301:
    case 'CODE_DEVICE_SERVER_SIGHUP':
      return Code.CODE_DEVICE_SERVER_SIGHUP;
    case 3302:
    case 'CODE_DEVICE_SERVER_SIGINT':
      return Code.CODE_DEVICE_SERVER_SIGINT;
    case 3303:
    case 'CODE_DEVICE_SERVER_SIGQUIT':
      return Code.CODE_DEVICE_SERVER_SIGQUIT;
    case 3304:
    case 'CODE_DEVICE_SERVER_SIGILL':
      return Code.CODE_DEVICE_SERVER_SIGILL;
    case 3305:
    case 'CODE_DEVICE_SERVER_SIGTRAP':
      return Code.CODE_DEVICE_SERVER_SIGTRAP;
    case 3306:
    case 'CODE_DEVICE_SERVER_SIGABRT':
      return Code.CODE_DEVICE_SERVER_SIGABRT;
    case 3308:
    case 'CODE_DEVICE_SERVER_SIGFPE':
      return Code.CODE_DEVICE_SERVER_SIGFPE;
    case 3309:
    case 'CODE_DEVICE_SERVER_SIGKILL':
      return Code.CODE_DEVICE_SERVER_SIGKILL;
    case 3311:
    case 'CODE_DEVICE_SERVER_SIGSEGV':
      return Code.CODE_DEVICE_SERVER_SIGSEGV;
    case 3313:
    case 'CODE_DEVICE_SERVER_SIGPIPE':
      return Code.CODE_DEVICE_SERVER_SIGPIPE;
    case 3314:
    case 'CODE_DEVICE_SERVER_SIGALRM':
      return Code.CODE_DEVICE_SERVER_SIGALRM;
    case 3315:
    case 'CODE_DEVICE_SERVER_SIGTERM':
      return Code.CODE_DEVICE_SERVER_SIGTERM;
    case 3400:
    case 'CODE_DEVICE_SERVER_DEVICE_NOT_FOUND':
      return Code.CODE_DEVICE_SERVER_DEVICE_NOT_FOUND;
    case 3401:
    case 'CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND':
      return Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND;
    case 3402:
    case 'CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND':
      return Code.CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND;
    case 3403:
    case 'CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND':
      return Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND;
    case 3404:
    case 'CODE_DEVICE_SERVER_APPIUM_CAPABILITIES_NOT_FOUND':
      return Code.CODE_DEVICE_SERVER_APPIUM_CAPABILITIES_NOT_FOUND;
    case 3999:
    case 'CODE_DEVICE_SERVER_END':
      return Code.CODE_DEVICE_SERVER_END;
    case 4000:
    case 'CODE_DEVICE_CONTROLLER_BEGIN':
      return Code.CODE_DEVICE_CONTROLLER_BEGIN;
    case 4001:
    case 'CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED':
      return Code.CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED;
    case 4002:
    case 'CODE_DEVICE_CONTROLLER_INPUT_PERMISSION_DENIED':
      return Code.CODE_DEVICE_CONTROLLER_INPUT_PERMISSION_DENIED;
    case 4003:
    case 'CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN':
      return Code.CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN;
    case 4999:
    case 'CODE_DEVICE_CONTROLLER_END':
      return Code.CODE_DEVICE_CONTROLLER_END;
    case 5000:
    case 'CODE_ANDROID_DEVICE_AGENT_BEGIN':
      return Code.CODE_ANDROID_DEVICE_AGENT_BEGIN;
    case 5001:
    case 'CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN':
      return Code.CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN;
    case 5002:
    case 'CODE_ANDROID_DEVICE_AGENT_CLIPBOARD_NOTAVAILABLE':
      return Code.CODE_ANDROID_DEVICE_AGENT_CLIPBOARD_NOTAVAILABLE;
    case 5999:
    case 'CODE_ANDROID_DEVICE_AGENT_END':
      return Code.CODE_ANDROID_DEVICE_AGENT_END;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Code.UNRECOGNIZED;
  }
}

export function codeToJSON(object: Code): string {
  switch (object) {
    case Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED:
      return 'CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED';
    case Code.CODE_UNEXPECTED_ERROR:
      return 'CODE_UNEXPECTED_ERROR';
    case Code.CODE_NUMBER_UNDER_RANGE:
      return 'CODE_NUMBER_UNDER_RANGE';
    case Code.CODE_NUMBER_OVER_RANGE:
      return 'CODE_NUMBER_OVER_RANGE';
    case Code.CODE_NUMBER_ZERO:
      return 'CODE_NUMBER_ZERO';
    case Code.CODE_NUMBER_NULL:
      return 'CODE_NUMBER_NULL';
    case Code.CODE_STRING_UNDER_RANGE:
      return 'CODE_STRING_UNDER_RANGE';
    case Code.CODE_STRING_OVER_RANGE:
      return 'CODE_STRING_OVER_RANGE';
    case Code.CODE_STRING_EMPTY:
      return 'CODE_STRING_EMPTY';
    case Code.CODE_STRING_NULL:
      return 'CODE_STRING_NULL';
    case Code.CODE_STRING_PARSE_FAILED:
      return 'CODE_STRING_PARSE_FAILED';
    case Code.CODE_STRING_INVALID_CHARACTER:
      return 'CODE_STRING_INVALID_CHARACTER';
    case Code.CODE_STRING_ENCODING_FAILED:
      return 'CODE_STRING_ENCODING_FAILED';
    case Code.CODE_STRING_DECODING_FAILED:
      return 'CODE_STRING_DECODING_FAILED';
    case Code.CODE_STRING_CONVERSION_FAILED:
      return 'CODE_STRING_CONVERSION_FAILED';
    case Code.CODE_STRING_INVALID_SYNTAX:
      return 'CODE_STRING_INVALID_SYNTAX';
    case Code.CODE_BINARY_UNDER_RANGE:
      return 'CODE_BINARY_UNDER_RANGE';
    case Code.CODE_BINARY_OVER_RANGE:
      return 'CODE_BINARY_OVER_RANGE';
    case Code.CODE_BINARY_EMPTY:
      return 'CODE_BINARY_EMPTY';
    case Code.CODE_BINARY_NULL:
      return 'CODE_BINARY_NULL';
    case Code.CODE_BINARY_ENCODING_FAILED:
      return 'CODE_BINARY_ENCODING_FAILED';
    case Code.CODE_BINARY_DECODING_FAILED:
      return 'CODE_BINARY_DECODING_FAILED';
    case Code.CODE_BINARY_CONVERSION_FAILED:
      return 'CODE_BINARY_CONVERSION_FAILED';
    case Code.CODE_BINARY_VALIDATION_FAILED:
      return 'CODE_BINARY_VALIDATION_FAILED';
    case Code.CODE_DATE_INVALID_YEAR:
      return 'CODE_DATE_INVALID_YEAR';
    case Code.CODE_DATE_INVALID_MONTH:
      return 'CODE_DATE_INVALID_MONTH';
    case Code.CODE_DATE_INVALID_DAY:
      return 'CODE_DATE_INVALID_DAY';
    case Code.CODE_DATE_INVALID_HOUR:
      return 'CODE_DATE_INVALID_HOUR';
    case Code.CODE_DATE_INVALID_MINITE:
      return 'CODE_DATE_INVALID_MINITE';
    case Code.CODE_DATE_INVALID_SECOND:
      return 'CODE_DATE_INVALID_SECOND';
    case Code.CODE_TIME_INVALID_TIMEZONE:
      return 'CODE_TIME_INVALID_TIMEZONE';
    case Code.CODE_ARRAY_UNDER_RANGE:
      return 'CODE_ARRAY_UNDER_RANGE';
    case Code.CODE_ARRAY_OVER_RANGE:
      return 'CODE_ARRAY_OVER_RANGE';
    case Code.CODE_ARRAY_EMPTY:
      return 'CODE_ARRAY_EMPTY';
    case Code.CODE_ARRAY_KEY_NOTFOUND:
      return 'CODE_ARRAY_KEY_NOTFOUND';
    case Code.CODE_MAP_KEY_NOTFOUND:
      return 'CODE_MAP_KEY_NOTFOUND';
    case Code.CODE_CONCURRENCY_LOCK_FAILED:
      return 'CODE_CONCURRENCY_LOCK_FAILED';
    case Code.CODE_CONCURRENCY_DEADLOCK:
      return 'CODE_CONCURRENCY_DEADLOCK';
    case Code.CODE_CONCURRENCY_RACE:
      return 'CODE_CONCURRENCY_RACE';
    case Code.CODE_FILESYSTEM_FILE_NOTFOUND:
      return 'CODE_FILESYSTEM_FILE_NOTFOUND';
    case Code.CODE_FILESYSTEM_DIRECTORY_NOTFOUND:
      return 'CODE_FILESYSTEM_DIRECTORY_NOTFOUND';
    case Code.CODE_FILESYSTEM_FILE_OPEN_FAILED:
      return 'CODE_FILESYSTEM_FILE_OPEN_FAILED';
    case Code.CODE_FILESYSTEM_FILE_CLOSE_FAILED:
      return 'CODE_FILESYSTEM_FILE_CLOSE_FAILED';
    case Code.CODE_FILESYSTEM_FILE_READ_FAILED:
      return 'CODE_FILESYSTEM_FILE_READ_FAILED';
    case Code.CODE_FILESYSTEM_FILE_WRITE_FAILED:
      return 'CODE_FILESYSTEM_FILE_WRITE_FAILED';
    case Code.CODE_FILESYSTEM_DISK_FULL:
      return 'CODE_FILESYSTEM_DISK_FULL';
    case Code.CODE_NETWORK_CONNECTION_FAILED:
      return 'CODE_NETWORK_CONNECTION_FAILED';
    case Code.CODE_NETWORK_CONNECTION_CLOSED:
      return 'CODE_NETWORK_CONNECTION_CLOSED';
    case Code.CODE_NETWORK_CONNECTION_TIMEOUT:
      return 'CODE_NETWORK_CONNECTION_TIMEOUT';
    case Code.CODE_NETWORK_CONNECTION_REFUSED:
      return 'CODE_NETWORK_CONNECTION_REFUSED';
    case Code.CODE_NETWORK_CONNECTION_ABORTED:
      return 'CODE_NETWORK_CONNECTION_ABORTED';
    case Code.CODE_NETWORK_CONNECTION_ALREADY_CONNECTED:
      return 'CODE_NETWORK_CONNECTION_ALREADY_CONNECTED';
    case Code.CODE_NETWORK_CONNECTION_INVALID_URI:
      return 'CODE_NETWORK_CONNECTION_INVALID_URI';
    case Code.CODE_PROCESS_FORK_FAILED:
      return 'CODE_PROCESS_FORK_FAILED';
    case Code.CODE_PROCESS_EXEC_FAILED:
      return 'CODE_PROCESS_EXEC_FAILED';
    case Code.CODE_PROCESS_WAIT_FAILED:
      return 'CODE_PROCESS_WAIT_FAILED';
    case Code.CODE_PROCESS_KILL_FAILED:
      return 'CODE_PROCESS_KILL_FAILED';
    case Code.CODE_PROCESS_SIGNAL_FAILED:
      return 'CODE_PROCESS_SIGNAL_FAILED';
    case Code.CODE_PROCESS_SIGNAL_NOT_SUPPORTED:
      return 'CODE_PROCESS_SIGNAL_NOT_SUPPORTED';
    case Code.CODE_MEMORY_ALLOCATION_FAILED:
      return 'CODE_MEMORY_ALLOCATION_FAILED';
    case Code.CODE_MEMORY_REALLOCATION_FAILED:
      return 'CODE_MEMORY_REALLOCATION_FAILED';
    case Code.CODE_MEMORY_FREE_FAILED:
      return 'CODE_MEMORY_FREE_FAILED';
    case Code.CODE_MEMORY_OUT_OF_MEMORY:
      return 'CODE_MEMORY_OUT_OF_MEMORY';
    case Code.CODE_SECURITY_UNAUTHENTICATED:
      return 'CODE_SECURITY_UNAUTHENTICATED';
    case Code.CODE_SECURITY_UNAUTHORISED:
      return 'CODE_SECURITY_UNAUTHORISED';
    case Code.CODE_SECURITY_PERMISSION_DENIED:
      return 'CODE_SECURITY_PERMISSION_DENIED';
    case Code.CODE_SECURITY_INVALID_TOKEN:
      return 'CODE_SECURITY_INVALID_TOKEN';
    case Code.CODE_INPUT_NOTREADY:
      return 'CODE_INPUT_NOTREADY';
    case Code.CODE_INPUT_DISCARDED:
      return 'CODE_INPUT_DISCARDED';
    case Code.CODE_INPUT_UNKNOWN:
      return 'CODE_INPUT_UNKNOWN';
    case Code.CODE_SCREENRECORD_NOTREADY:
      return 'CODE_SCREENRECORD_NOTREADY';
    case Code.CODE_SCREENRECORD_ALREADY_RECORDING:
      return 'CODE_SCREENRECORD_ALREADY_RECORDING';
    case Code.CODE_SCREENRECORD_NOTSTARTED:
      return 'CODE_SCREENRECORD_NOTSTARTED';
    case Code.CODE_SCREENRECORD_MULTIPLE_RECORDING:
      return 'CODE_SCREENRECORD_MULTIPLE_RECORDING';
    case Code.CODE_SCREENRECORD_NOTFOUND:
      return 'CODE_SCREENRECORD_NOTFOUND';
    case Code.CODE_SCREENRECORD_NOTSUPPORTED:
      return 'CODE_SCREENRECORD_NOTSUPPORTED';
    case Code.CODE_WEBRTC_PEERCONNECTION_FAILED:
      return 'CODE_WEBRTC_PEERCONNECTION_FAILED';
    case Code.CODE_WEBRTC_CODEC_NOTSUPPORTED:
      return 'CODE_WEBRTC_CODEC_NOTSUPPORTED';
    case Code.CODE_DEVICE_NOTFOUND:
      return 'CODE_DEVICE_NOTFOUND';
    case Code.CODE_COMMON_END:
      return 'CODE_COMMON_END';
    case Code.CODE_DOST_SUCCESS_BEGIN:
      return 'CODE_DOST_SUCCESS_BEGIN';
    case Code.CODE_DOST_END:
      return 'CODE_DOST_END';
    case Code.CODE_HOST_AGENT_SUCCESS_BEGIN:
      return 'CODE_HOST_AGENT_SUCCESS_BEGIN';
    case Code.CODE_HOST_AGENT_UNEXPECTED_ERROR:
      return 'CODE_HOST_AGENT_UNEXPECTED_ERROR';
    case Code.CODE_HOST_AGENT_INVALID_ENV:
      return 'CODE_HOST_AGENT_INVALID_ENV';
    case Code.CODE_HOST_AGENT_PORT_IN_USE:
      return 'CODE_HOST_AGENT_PORT_IN_USE';
    case Code.CODE_HOST_AGENT_EXIT_CODE_END:
      return 'CODE_HOST_AGENT_EXIT_CODE_END';
    case Code.CODE_HOST_AGENT_SIGHUP:
      return 'CODE_HOST_AGENT_SIGHUP';
    case Code.CODE_HOST_AGENT_SIGINT:
      return 'CODE_HOST_AGENT_SIGINT';
    case Code.CODE_HOST_AGENT_SIGQUIT:
      return 'CODE_HOST_AGENT_SIGQUIT';
    case Code.CODE_HOST_AGENT_SIGILL:
      return 'CODE_HOST_AGENT_SIGILL';
    case Code.CODE_HOST_AGENT_SIGTRAP:
      return 'CODE_HOST_AGENT_SIGTRAP';
    case Code.CODE_HOST_AGENT_SIGABRT:
      return 'CODE_HOST_AGENT_SIGABRT';
    case Code.CODE_HOST_AGENT_SIGFPE:
      return 'CODE_HOST_AGENT_SIGFPE';
    case Code.CODE_HOST_AGENT_SIGKILL:
      return 'CODE_HOST_AGENT_SIGKILL';
    case Code.CODE_HOST_AGENT_SIGSEGV:
      return 'CODE_HOST_AGENT_SIGSEGV';
    case Code.CODE_HOST_AGENT_SIGPIPE:
      return 'CODE_HOST_AGENT_SIGPIPE';
    case Code.CODE_HOST_AGENT_SIGALRM:
      return 'CODE_HOST_AGENT_SIGALRM';
    case Code.CODE_HOST_AGENT_SIGTERM:
      return 'CODE_HOST_AGENT_SIGTERM';
    case Code.CODE_HOST_AGENT_DEVICE_REQUEST_FAILED:
      return 'CODE_HOST_AGENT_DEVICE_REQUEST_FAILED';
    case Code.CODE_HOST_AGENT_INVALID_TOKEN:
      return 'CODE_HOST_AGENT_INVALID_TOKEN';
    case Code.CODE_HOST_AGENT_CONNECTION_REFUSED:
      return 'CODE_HOST_AGENT_CONNECTION_REFUSED';
    case Code.CODE_HOST_AGENT_NOT_RUNNING:
      return 'CODE_HOST_AGENT_NOT_RUNNING';
    case Code.CODE_HOST_AGENT_REQUEST_FAILED:
      return 'CODE_HOST_AGENT_REQUEST_FAILED';
    case Code.CODE_HOST_AGENT_END:
      return 'CODE_HOST_AGENT_END';
    case Code.CODE_DEVICE_SERVER_SUCCESS_BEGIN:
      return 'CODE_DEVICE_SERVER_SUCCESS_BEGIN';
    case Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR:
      return 'CODE_DEVICE_SERVER_UNEXPECTED_ERROR';
    case Code.CODE_DEVICE_SERVER_INVALID_ENV:
      return 'CODE_DEVICE_SERVER_INVALID_ENV';
    case Code.CODE_DEVICE_SERVER_PORT_IN_USE:
      return 'CODE_DEVICE_SERVER_PORT_IN_USE';
    case Code.CODE_DEVICE_SERVER_EXIT_CODE_END:
      return 'CODE_DEVICE_SERVER_EXIT_CODE_END';
    case Code.CODE_DEVICE_SERVER_SIGHUP:
      return 'CODE_DEVICE_SERVER_SIGHUP';
    case Code.CODE_DEVICE_SERVER_SIGINT:
      return 'CODE_DEVICE_SERVER_SIGINT';
    case Code.CODE_DEVICE_SERVER_SIGQUIT:
      return 'CODE_DEVICE_SERVER_SIGQUIT';
    case Code.CODE_DEVICE_SERVER_SIGILL:
      return 'CODE_DEVICE_SERVER_SIGILL';
    case Code.CODE_DEVICE_SERVER_SIGTRAP:
      return 'CODE_DEVICE_SERVER_SIGTRAP';
    case Code.CODE_DEVICE_SERVER_SIGABRT:
      return 'CODE_DEVICE_SERVER_SIGABRT';
    case Code.CODE_DEVICE_SERVER_SIGFPE:
      return 'CODE_DEVICE_SERVER_SIGFPE';
    case Code.CODE_DEVICE_SERVER_SIGKILL:
      return 'CODE_DEVICE_SERVER_SIGKILL';
    case Code.CODE_DEVICE_SERVER_SIGSEGV:
      return 'CODE_DEVICE_SERVER_SIGSEGV';
    case Code.CODE_DEVICE_SERVER_SIGPIPE:
      return 'CODE_DEVICE_SERVER_SIGPIPE';
    case Code.CODE_DEVICE_SERVER_SIGALRM:
      return 'CODE_DEVICE_SERVER_SIGALRM';
    case Code.CODE_DEVICE_SERVER_SIGTERM:
      return 'CODE_DEVICE_SERVER_SIGTERM';
    case Code.CODE_DEVICE_SERVER_DEVICE_NOT_FOUND:
      return 'CODE_DEVICE_SERVER_DEVICE_NOT_FOUND';
    case Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND:
      return 'CODE_DEVICE_SERVER_APPIUM_CONTEXT_NOT_FOUND';
    case Code.CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND:
      return 'CODE_DEVICE_SERVER_GAMIUM_CONTEXT_NOT_FOUND';
    case Code.CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND:
      return 'CODE_DEVICE_SERVER_APPIUM_CONTEXT_INFO_NOT_FOUND';
    case Code.CODE_DEVICE_SERVER_APPIUM_CAPABILITIES_NOT_FOUND:
      return 'CODE_DEVICE_SERVER_APPIUM_CAPABILITIES_NOT_FOUND';
    case Code.CODE_DEVICE_SERVER_END:
      return 'CODE_DEVICE_SERVER_END';
    case Code.CODE_DEVICE_CONTROLLER_BEGIN:
      return 'CODE_DEVICE_CONTROLLER_BEGIN';
    case Code.CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED:
      return 'CODE_DEVICE_CONTROLLER_INPUT_NOTSUPPORTED';
    case Code.CODE_DEVICE_CONTROLLER_INPUT_PERMISSION_DENIED:
      return 'CODE_DEVICE_CONTROLLER_INPUT_PERMISSION_DENIED';
    case Code.CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN:
      return 'CODE_DEVICE_CONTROLLER_INPUT_UNKNOWN';
    case Code.CODE_DEVICE_CONTROLLER_END:
      return 'CODE_DEVICE_CONTROLLER_END';
    case Code.CODE_ANDROID_DEVICE_AGENT_BEGIN:
      return 'CODE_ANDROID_DEVICE_AGENT_BEGIN';
    case Code.CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN:
      return 'CODE_ANDROID_DEVICE_AGENT_INPUT_UNKNOWN';
    case Code.CODE_ANDROID_DEVICE_AGENT_CLIPBOARD_NOTAVAILABLE:
      return 'CODE_ANDROID_DEVICE_AGENT_CLIPBOARD_NOTAVAILABLE';
    case Code.CODE_ANDROID_DEVICE_AGENT_END:
      return 'CODE_ANDROID_DEVICE_AGENT_END';
    case Code.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface ErrorResult {
  code: Code;
  message: string;
  details?: { [key: string]: any } | undefined;
}

function createBaseErrorResult(): ErrorResult {
  return { code: 0, message: '', details: undefined };
}

export const ErrorResult = {
  encode(message: ErrorResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.message !== '') {
      writer.uint32(18).string(message.message);
    }
    if (message.details !== undefined) {
      Struct.encode(Struct.wrap(message.details), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ErrorResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseErrorResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.int32() as any;
          break;
        case 2:
          message.message = reader.string();
          break;
        case 3:
          message.details = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ErrorResult {
    return {
      code: isSet(object.code) ? codeFromJSON(object.code) : 0,
      message: isSet(object.message) ? String(object.message) : '',
      details: isObject(object.details) ? object.details : undefined,
    };
  },

  toJSON(message: ErrorResult): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = codeToJSON(message.code));
    message.message !== undefined && (obj.message = message.message);
    message.details !== undefined && (obj.details = message.details);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ErrorResult>, I>>(object: I): ErrorResult {
    const message = createBaseErrorResult();
    message.code = object.code ?? 0;
    message.message = object.message ?? '';
    message.details = object.details ?? undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string }
  ? { [K in keyof Omit<T, '$case'>]?: DeepPartial<T[K]> } & { $case: T['$case'] }
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
type Exact<P, I extends P> = P extends Builtin ? P : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
