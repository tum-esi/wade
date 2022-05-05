// This file was generated on Wed Mar 11, 2020 18:16 (UTC+01)
// by REx v5.49 which is Copyright (c) 1979-2019 by Gunther Rademacher <grd@gmx.net>
// REx command line: grammar2.ebnf -javascript -backtrack -ll 10

// all manual adaptions are encapsulated by comments with: ####### adapted ######

// ########### adapted ###########
/* eslint-disable no-bitwise */
/* eslint-disable one-var */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable no-var */
/* eslint-disable id-blacklist */
let DEBUG = {
  s: '',
  m: '',
  l: '',
  e: ''
};
// ########### - ###########

function validateSeqD(this: any, string: string) {
  init(string);

  var thisParser = this;

  this.ParseException = function(b, e, s, o, x) {
    var begin = b;
    var end = e;
    var state = s;
    var offending = o;
    var expected = x;

    // ########### adapted ###########
    DEBUG = {
      s: string.slice(begin - 1, end + 1),
      m: string.slice(begin - 2, end + 2),
      l: string.slice(begin - 15, end + 15),
      e: DEBUG.e
    };
    // ########### - ###########

    this.getBegin = function() {return begin; };
    this.getEnd = function() {return end; };
    this.getState = function() {return state; };
    this.getExpected = function() {return expected; };
    this.getOffending = function() {return offending; };
    this.isAmbiguousInput = function() {return false; };

    this.getMessage = function() {
      return offending < 0
           ? 'lexical analysis failed'
           : 'syntax error';
    };
  };

  function init(source) {
    input = source;
    size = source.length;
    reset(0, 0, 0);
  }

  this.getInput = function() {
    return input;
  };

  this.getTokenOffset = function() {
    return b0;
  };

  this.getTokenEnd = function() {
    return e0;
  };

  function reset(l, b, e) {
            b0 = b; e0 = b;
    l1 = l; b1 = b; e1 = e;
    l2 = 0;
    l3 = 0;
    l4 = 0;
    l5 = 0;
    l6 = 0;
    l7 = 0;
    l8 = 0;
    l9 = 0;
    l10 = 0;
    end = e;
    ex = -1;
    memo = {};
  }

  this.reset = function(l, b, e) {
    reset(l, b, e);
  };

  this.getOffendingToken = function(e) {
    var o = e.getOffending();
    return o >= 0 ? validateSeqD.TOKEN[o] : null;
  };

  this.getExpectedTokenSet = function(e) {
    var expected;
    if (e.getExpected() < 0) {
      expected = validateSeqD.getTokenSet(- e.getState());
    } else {
      expected = [validateSeqD.TOKEN[e.getExpected()]];
    }
    return expected;
  };

  this.getErrorMessage = function(e) {
    var message = e.getMessage();
    var found = this.getOffendingToken(e);
    var tokenSet = this.getExpectedTokenSet(e);
    var size = e.getEnd() - e.getBegin();
    message += (found == null ? '' : ', found ' + found)
            + '\nwhile expecting '
            + (tokenSet.length == 1 ? tokenSet[0] : ('[' + tokenSet.join(', ') + ']'))
            + '\n'
            + (size == 0 || found != null ? '' : 'after successfully scanning ' + size + ' characters beginning ');
    var prefix = input.substring(0, e.getBegin());
    var lines = prefix.split('\n');
    var line = lines.length;
    var column = lines[line - 1].length + 1;
    return message
         + 'at line ' + line + ', column ' + column + ':\n...'
         + input.substring(e.getBegin(), Math.min(input.length, e.getBegin() + 64))
         + '...';
  };

  this.parse_mashup = function() {
    for (;;) {
      parse_diagram();
      lookahead1(38);               // END | '@startuml'
      if (l1 != 24) {
        break;
      }
    }
  };

  this.parse_safetitle = function() {
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
    lookahead1(2);                  // Title
    consume(4);                     // Title
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
  };

  function parse_diagram() {
    parse_header();
    parse_content();
    parse_footer();
  }

  function parse_header() {
    lookahead1(20);                 // '@startuml'
    consume(24);                    // '@startuml'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(2);                  // Title
    consume(4);                     // Title
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(22);                 // '['
    consume(26);                    // '['
    lookahead1(14);                 // '->'
    consume(18);                    // '->'
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(4);                  // Diatype
    consume(7);                     // Diatype
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(2);                  // Title
    consume(4);                     // Title
    lookahead1(9);                  // '()'
    consume(13);                    // '()'
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(23);                 // 'activate'
    consume(29);                    // 'activate'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_footer() {
    consume(27);                    // '[<-'
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(26);                 // 'deactivate'
    consume(36);                    // 'deactivate'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(19);                 // '@enduml'
    consume(23);                    // '@enduml'
    lookahead1(48);                 // END | L | '@startuml'
    if (l1 == 2) {
      consume(2);                   // L
    }
  }

  function parse_content() {
    for (;;) {
      lookahead1(62);               // '...' | 'alt' | 'group' | 'loop' | 'note' | 'ref'
      switch (l1) {
      case 48:                      // 'loop'
        parse_loop();
        break;
      case 19:                      // '...'
        parse_wait();
        break;
      case 31:                      // 'alt'
        parse_condition();
        break;
      case 46:                      // 'group'
        parse_interaction();
        break;
      case 51:                      // 'note'
        parse_getset();
        break;
      default:
        parse_ref();
      }
      lookahead1(66);               // '...' | '[<-' | 'alt' | 'else else' | 'end' | 'group' | 'loop' | 'note' | 'ref'
      if (l1 == 27                  // '[<-'
       || l1 == 39                  // 'else else'
       || l1 == 40) {
        break;
      }
    }
  }

  function parse_loop() {
    consume(48);                    // 'loop'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(50);                 // Nr | 'every' | 'forever'
    switch (l1) {
    case 41:                        // 'every'
      consume(41);                  // 'every'
      lookahead1(1);                // S
      consume(3);                   // S
      lookahead1(6);                // Nr
      consume(10);                  // Nr
      lookahead1(28);               // 'ms'
      consume(49);                  // 'ms'
      break;
    case 43:                        // 'forever'
      consume(43);                  // 'forever'
      break;
    default:
      consume(10);                  // Nr
      lookahead1(37);               // 'x'
      consume(68);                  // 'x'
    }
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_content();
    consume(40);                    // 'end'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_wait() {
    consume(19);                    // '...'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(36);                 // 'wait'
    consume(66);                    // 'wait'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(6);                  // Nr
    consume(10);                    // Nr
    lookahead1(28);                 // 'ms'
    consume(49);                    // 'ms'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(15);                 // '...'
    consume(19);                    // '...'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_condition() {
    consume(31);                    // 'alt'
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_comparison();
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_content();
    consume(39);                    // 'else else'
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(65);                 // '...' | 'alt' | 'end' | 'group' | 'loop' | 'note' | 'ref'
    if (l1 != 40) {
      parse_content();
    }
    consume(40);                    // 'end'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_comparison() {
    lookahead1(63);                 // 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
    switch (l1) {
    case 50:                        // 'not('
      consume(50);                  // 'not('
      lookahead1(64);               // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
      if (l1 == 3) {
        consume(3);                 // S
      }
      parse_comparison();
      lookahead1(40);               // S | ')'
      if (l1 == 3) {
        consume(3);                 // S
      }
      lookahead1(10);               // ')'
      consume(14);                  // ')'
      break;
    case 30:                        // 'allOf('
      consume(30);                  // 'allOf('
      lookahead1(64);               // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
      if (l1 == 3) {
        consume(3);                 // S
      }
      parse_comparison();
      for (;;) {
        lookahead1(49);             // S | ')' | ','
        switch (l1) {
        case 3:                     // S
          lookahead2(128, 44);      // ')' | ','
          break;
        default:
          lk = l1;
        }
        if (lk != 15                // ','
         && lk != 143) {
          break;
        }
        if (l1 == 3) {
          consume(3);               // S
        }
        lookahead1(11);             // ','
        consume(15);                // ','
        lookahead1(64);             // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
        if (l1 == 3) {
          consume(3);               // S
        }
        parse_comparison();
      }
      if (l1 == 3) {
        consume(3);                 // S
      }
      lookahead1(10);               // ')'
      consume(14);                  // ')'
      break;
    case 53:                        // 'oneOf('
      consume(53);                  // 'oneOf('
      lookahead1(64);               // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
      if (l1 == 3) {
        consume(3);                 // S
      }
      parse_comparison();
      for (;;) {
        lookahead1(49);             // S | ')' | ','
        switch (l1) {
        case 3:                     // S
          lookahead2(128, 44);      // ')' | ','
          break;
        default:
          lk = l1;
        }
        if (lk != 15                // ','
         && lk != 143) {
          break;
        }
        if (l1 == 3) {
          consume(3);               // S
        }
        lookahead1(11);             // ','
        consume(15);                // ','
        lookahead1(64);             // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
        if (l1 == 3) {
          consume(3);               // S
        }
        parse_comparison();
      }
      if (l1 == 3) {
        consume(3);                 // S
      }
      lookahead1(10);               // ')'
      consume(14);                  // ')'
      break;
    case 32:                        // 'anyOf('
      consume(32);                  // 'anyOf('
      lookahead1(64);               // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
      if (l1 == 3) {
        consume(3);                 // S
      }
      parse_comparison();
      for (;;) {
        lookahead1(49);             // S | ')' | ','
        switch (l1) {
        case 3:                     // S
          lookahead2(128, 44);      // ')' | ','
          break;
        default:
          lk = l1;
        }
        if (lk != 15                // ','
         && lk != 143) {
          break;
        }
        if (l1 == 3) {
          consume(3);               // S
        }
        lookahead1(11);             // ','
        consume(15);                // ','
        lookahead1(64);             // S | 'allOf(' | 'anyOf(' | 'not(' | 'oneOf(' | 'property' | 'variable'
        if (l1 == 3) {
          consume(3);               // S
        }
        parse_comparison();
      }
      if (l1 == 3) {
        consume(3);                 // S
      }
      lookahead1(10);               // ')'
      consume(14);                  // ')'
      break;
    default:
      switch (l1) {
      case 65:                      // 'variable'
        consume(65);                // 'variable'
        break;
      default:
        consume(57);                // 'property'
      }
      lookahead1(1);                // S
      consume(3);                   // S
      lookahead1(5);                // VarName
      consume(8);                   // VarName
      lookahead1(54);               // L | S | ')' | ','
      switch (l1) {
      case 3:                       // S
        lookahead2(128, 52);        // ')' | ',' | '=='
        break;
      default:
        lk = l1;
      }
      if (lk == 149) {
        consume(3);                 // S
        lookahead1(17);             // '=='
        consume(21);                // '=='
        lookahead1(1);              // S
        consume(3);                 // S
        lookahead1(61);             // Nr | '"' | 'false' | 'property' | 'true' | 'variable'
        switch (l1) {
        case 64:                    // 'true'
          consume(64);              // 'true'
          break;
        case 42:                    // 'false'
          consume(42);              // 'false'
          break;
        case 11:                    // '"'
          consume(11);              // '"'
          for (;;) {
            lookahead1(42);         // Char | '"'
            if (l1 != 9) {
              break;
            }
            consume(9);             // Char
          }
          consume(11);              // '"'
          break;
        case 10:                    // Nr
          consume(10);              // Nr
          break;
        default:
          switch (l1) {
          case 65:                  // 'variable'
            consume(65);            // 'variable'
            break;
          default:
            consume(57);            // 'property'
          }
          lookahead1(1);            // S
          consume(3);               // S
          lookahead1(5);            // VarName
          consume(8);               // VarName
        }
      }
    }
  }

  function parse_interaction() {
    consume(46);                    // 'group'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(35);                 // 'strict'
    consume(62);                    // 'strict'
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_interactionRecCont();
    parse_interactionSendCont();
    lookahead1(27);                 // 'end'
    consume(40);                    // 'end'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_interactionRecCont() {
    lookahead1(32);                 // 'par'
    consume(56);                    // 'par'
    lookahead1(0);                  // L
    consume(2);                     // L
    for (;;) {
      lookahead1(55);               // '"Agent"' | 'break' | 'end' | 'note'
      if (l1 != 12                  // '"Agent"'
       && l1 != 51) {
        break;
      }
      parse_interactionReceive();
      lookahead1(60);               // '"Agent"' | 'break' | 'else' | 'end' | 'note'
      if (l1 == 38) {
        consume(38);                // 'else'
        lookahead1(0);              // L
        consume(2);                 // L
      }
    }
    if (l1 == 33) {
      consume(33);                  // 'break'
      lookahead1(1);                // S
      consume(3);                   // S
      lookahead1(25);               // 'data-pushed'
      consume(35);                  // 'data-pushed'
      lookahead1(0);                // L
      consume(2);                   // L
      lookahead1(27);               // 'end'
      consume(40);                  // 'end'
      lookahead1(0);                // L
      consume(2);                   // L
    }
    lookahead1(27);                 // 'end'
    consume(40);                    // 'end'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_interactionSendCont() {
    lookahead1(32);                 // 'par'
    consume(56);                    // 'par'
    lookahead1(0);                  // L
    consume(2);                     // L
    for (;;) {
      lookahead1(51);               // '"Agent"' | 'end' | 'note'
      if (l1 == 40) {
        break;
      }
      parse_interactionSend();
      lookahead1(56);               // '"Agent"' | 'else' | 'end' | 'note'
      if (l1 == 38) {
        consume(38);                // 'else'
        lookahead1(0);              // L
        consume(2);                 // L
      }
    }
    consume(40);                    // 'end'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_interactionReceive() {
    if (l1 == 51) {
      parse_getset();
    }
    parse_interactionPre();
    lookahead1(58);                 // 'invokeAction:' | 'observeProperty:' | 'readProperty:' | 'subscribeEvent:'
    switch (l1) {
    case 63:                        // 'subscribeEvent:'
      parse_receiveSubs();
      break;
    case 47:                        // 'invokeAction:'
      parse_receiveInv();
      break;
    case 52:                        // 'observeProperty:'
      parse_receiveObs();
      break;
    default:
      parse_receiveRead();
    }
    lookahead1(60);                 // '"Agent"' | 'break' | 'else' | 'end' | 'note'
    switch (l1) {
    case 51:                        // 'note'
      lookahead2(128, 1);           // S
      switch (lk) {
      case 131:                     // 'note' S
        lookahead3(256, 31);        // 'over'
        switch (lk) {
        case 311:                   // 'note' S 'over'
          lookahead4(384, 1);       // S
          switch (lk) {
          case 387:                 // 'note' S 'over' S
            lookahead5(512, 43);    // '"' | 'Agent'
            switch (lk) {
            case 523:               // 'note' S 'over' S '"'
              lookahead6(640, 21);  // 'Agent'
              switch (lk) {
              case 665:             // 'note' S 'over' S '"' 'Agent'
                lookahead7(768, 39); // L | '"'
                switch (lk) {
                case 770:           // 'note' S 'over' S '"' 'Agent' L
                  lookahead8(896, 53); // 'defaultInput' | 'get' | 'set'
                  switch (lk) {
                  case 933:         // 'note' S 'over' S '"' 'Agent' L 'defaultInput'
                    lookahead9(1024, 1); // S
                    switch (lk) {
                    case 1027:      // 'note' S 'over' S '"' 'Agent' L 'defaultInput' S
                      lookahead10(1152, 59); // Nr | '"' | 'false' | 'true' | '{'
                      break;
                    }
                    break;
                  case 941:         // 'note' S 'over' S '"' 'Agent' L 'get'
                    lookahead9(1280, 1); // S
                    switch (lk) {
                    case 1283:      // 'note' S 'over' S '"' 'Agent' L 'get' S
                      lookahead10(1408, 47); // 'property' | 'variable'
                      break;
                    }
                    break;
                  case 957:         // 'note' S 'over' S '"' 'Agent' L 'set'
                    lookahead9(1536, 1); // S
                    break;
                  }
                  break;
                case 779:           // 'note' S 'over' S '"' 'Agent' '"'
                  lookahead8(1792, 0); // L
                  switch (lk) {
                  case 1794:        // 'note' S 'over' S '"' 'Agent' '"' L
                    lookahead9(1920, 53); // 'defaultInput' | 'get' | 'set'
                    switch (lk) {
                    case 1957:      // 'note' S 'over' S '"' 'Agent' '"' L 'defaultInput'
                      lookahead10(2048, 1); // S
                      break;
                    case 1965:      // 'note' S 'over' S '"' 'Agent' '"' L 'get'
                      lookahead10(2176, 1); // S
                      break;
                    case 1981:      // 'note' S 'over' S '"' 'Agent' '"' L 'set'
                      lookahead10(2304, 1); // S
                      break;
                    }
                    break;
                  }
                  break;
                }
                break;
              }
              break;
            case 537:               // 'note' S 'over' S 'Agent'
              lookahead6(2432, 39); // L | '"'
              switch (lk) {
              case 2434:            // 'note' S 'over' S 'Agent' L
                lookahead7(2560, 53); // 'defaultInput' | 'get' | 'set'
                switch (lk) {
                case 2597:          // 'note' S 'over' S 'Agent' L 'defaultInput'
                  lookahead8(2688, 1); // S
                  switch (lk) {
                  case 2691:        // 'note' S 'over' S 'Agent' L 'defaultInput' S
                    lookahead9(2816, 59); // Nr | '"' | 'false' | 'true' | '{'
                    switch (lk) {
                    case 2826:      // 'note' S 'over' S 'Agent' L 'defaultInput' S Nr
                      lookahead10(2944, 0); // L
                      break;
                    case 2827:      // 'note' S 'over' S 'Agent' L 'defaultInput' S '"'
                      lookahead10(3072, 42); // Char | '"'
                      break;
                    case 2858:      // 'note' S 'over' S 'Agent' L 'defaultInput' S 'false'
                      lookahead10(3200, 0); // L
                      break;
                    case 2880:      // 'note' S 'over' S 'Agent' L 'defaultInput' S 'true'
                      lookahead10(3328, 0); // L
                      break;
                    case 2885:      // 'note' S 'over' S 'Agent' L 'defaultInput' S '{'
                      lookahead10(3456, 41); // Nchar | '}'
                      break;
                    }
                    break;
                  }
                  break;
                case 2605:          // 'note' S 'over' S 'Agent' L 'get'
                  lookahead8(3584, 1); // S
                  switch (lk) {
                  case 3587:        // 'note' S 'over' S 'Agent' L 'get' S
                    lookahead9(3712, 47); // 'property' | 'variable'
                    switch (lk) {
                    case 3769:      // 'note' S 'over' S 'Agent' L 'get' S 'property'
                      lookahead10(3840, 1); // S
                      break;
                    case 3777:      // 'note' S 'over' S 'Agent' L 'get' S 'variable'
                      lookahead10(3968, 1); // S
                      break;
                    }
                    break;
                  }
                  break;
                case 2621:          // 'note' S 'over' S 'Agent' L 'set'
                  lookahead8(4096, 1); // S
                  break;
                }
                break;
              case 2443:            // 'note' S 'over' S 'Agent' '"'
                lookahead7(4608, 0); // L
                switch (lk) {
                case 4610:          // 'note' S 'over' S 'Agent' '"' L
                  lookahead8(4736, 53); // 'defaultInput' | 'get' | 'set'
                  switch (lk) {
                  case 4773:        // 'note' S 'over' S 'Agent' '"' L 'defaultInput'
                    lookahead9(4864, 1); // S
                    switch (lk) {
                    case 4867:      // 'note' S 'over' S 'Agent' '"' L 'defaultInput' S
                      lookahead10(4992, 59); // Nr | '"' | 'false' | 'true' | '{'
                      break;
                    }
                    break;
                  case 4781:        // 'note' S 'over' S 'Agent' '"' L 'get'
                    lookahead9(5120, 1); // S
                    switch (lk) {
                    case 5123:      // 'note' S 'over' S 'Agent' '"' L 'get' S
                      lookahead10(5248, 47); // 'property' | 'variable'
                      break;
                    }
                    break;
                  case 4797:        // 'note' S 'over' S 'Agent' '"' L 'set'
                    lookahead9(5376, 1); // S
                    break;
                  }
                  break;
                }
                break;
              }
              break;
            }
            break;
          }
          break;
        }
        break;
      }
      break;
    default:
      lk = l1;
    }
    if (lk != 12                    // '"Agent"'
     && lk != 33                    // 'break'
     && lk != 38                    // 'else'
     && lk != 40) {
      lk = memoized(0, e0);
      if (lk == 0) {
        var b0A = b0; var e0A = e0; var l1A = l1;
        var b1A = b1; var e1A = e1; var l2A = l2;
        var b2A = b2; var e2A = e2; var l3A = l3;
        var b3A = b3; var e3A = e3; var l4A = l4;
        var b4A = b4; var e4A = e4; var l5A = l5;
        var b5A = b5; var e5A = e5; var l6A = l6;
        var b6A = b6; var e6A = e6; var l7A = l7;
        var b7A = b7; var e7A = e7; var l8A = l8;
        var b8A = b8; var e8A = e8; var l9A = l9;
        var b9A = b9; var e9A = e9; var l10A = l10;
        var b10A = b10; var e10A = e10;
        try {
          try_getset();
          lk = -1;
        } catch (p1A) {
          lk = -2;
        }
        b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A; } else {
        b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A; } else {
        b2 = b2A; e2 = e2A; l3 = l3A; if (l3 == 0) {end = e2A; } else {
        b3 = b3A; e3 = e3A; l4 = l4A; if (l4 == 0) {end = e3A; } else {
        b4 = b4A; e4 = e4A; l5 = l5A; if (l5 == 0) {end = e4A; } else {
        b5 = b5A; e5 = e5A; l6 = l6A; if (l6 == 0) {end = e5A; } else {
        b6 = b6A; e6 = e6A; l7 = l7A; if (l7 == 0) {end = e6A; } else {
        b7 = b7A; e7 = e7A; l8 = l8A; if (l8 == 0) {end = e7A; } else {
        b8 = b8A; e8 = e8A; l9 = l9A; if (l9 == 0) {end = e8A; } else {
        b9 = b9A; e9 = e9A; l10 = l10A; if (l10 == 0) {end = e9A; } else {
        b10 = b10A; e10 = e10A; end = e10A; }}}}}}}}}}
        memoize(0, e0, lk);
      }
    }
    if (lk == -1) {
      parse_getset();
    }
  }

  function parse_interactionSend() {
    if (l1 == 51) {
      parse_getset();
    }
    parse_interactionPre();
    lookahead1(46);                 // 'invokeAction:' | 'writeProperty:'
    switch (l1) {
    case 67:                        // 'writeProperty:'
      parse_sendWrite();
      break;
    default:
      parse_sendInv();
    }
    parse_sendPost();
    lookahead1(56);                 // '"Agent"' | 'else' | 'end' | 'note'
    switch (l1) {
    case 51:                        // 'note'
      lookahead2(128, 1);           // S
      switch (lk) {
      case 131:                     // 'note' S
        lookahead3(256, 31);        // 'over'
        switch (lk) {
        case 311:                   // 'note' S 'over'
          lookahead4(384, 1);       // S
          switch (lk) {
          case 387:                 // 'note' S 'over' S
            lookahead5(512, 43);    // '"' | 'Agent'
            switch (lk) {
            case 523:               // 'note' S 'over' S '"'
              lookahead6(640, 21);  // 'Agent'
              switch (lk) {
              case 665:             // 'note' S 'over' S '"' 'Agent'
                lookahead7(768, 39); // L | '"'
                switch (lk) {
                case 770:           // 'note' S 'over' S '"' 'Agent' L
                  lookahead8(896, 53); // 'defaultInput' | 'get' | 'set'
                  switch (lk) {
                  case 933:         // 'note' S 'over' S '"' 'Agent' L 'defaultInput'
                    lookahead9(1024, 1); // S
                    switch (lk) {
                    case 1027:      // 'note' S 'over' S '"' 'Agent' L 'defaultInput' S
                      lookahead10(1152, 59); // Nr | '"' | 'false' | 'true' | '{'
                      break;
                    }
                    break;
                  case 941:         // 'note' S 'over' S '"' 'Agent' L 'get'
                    lookahead9(1280, 1); // S
                    switch (lk) {
                    case 1283:      // 'note' S 'over' S '"' 'Agent' L 'get' S
                      lookahead10(1408, 47); // 'property' | 'variable'
                      break;
                    }
                    break;
                  case 957:         // 'note' S 'over' S '"' 'Agent' L 'set'
                    lookahead9(1536, 1); // S
                    break;
                  }
                  break;
                case 779:           // 'note' S 'over' S '"' 'Agent' '"'
                  lookahead8(1792, 0); // L
                  switch (lk) {
                  case 1794:        // 'note' S 'over' S '"' 'Agent' '"' L
                    lookahead9(1920, 53); // 'defaultInput' | 'get' | 'set'
                    switch (lk) {
                    case 1957:      // 'note' S 'over' S '"' 'Agent' '"' L 'defaultInput'
                      lookahead10(2048, 1); // S
                      break;
                    case 1965:      // 'note' S 'over' S '"' 'Agent' '"' L 'get'
                      lookahead10(2176, 1); // S
                      break;
                    case 1981:      // 'note' S 'over' S '"' 'Agent' '"' L 'set'
                      lookahead10(2304, 1); // S
                      break;
                    }
                    break;
                  }
                  break;
                }
                break;
              }
              break;
            case 537:               // 'note' S 'over' S 'Agent'
              lookahead6(2432, 39); // L | '"'
              switch (lk) {
              case 2434:            // 'note' S 'over' S 'Agent' L
                lookahead7(2560, 53); // 'defaultInput' | 'get' | 'set'
                switch (lk) {
                case 2597:          // 'note' S 'over' S 'Agent' L 'defaultInput'
                  lookahead8(2688, 1); // S
                  switch (lk) {
                  case 2691:        // 'note' S 'over' S 'Agent' L 'defaultInput' S
                    lookahead9(2816, 59); // Nr | '"' | 'false' | 'true' | '{'
                    switch (lk) {
                    case 2826:      // 'note' S 'over' S 'Agent' L 'defaultInput' S Nr
                      lookahead10(2944, 0); // L
                      break;
                    case 2827:      // 'note' S 'over' S 'Agent' L 'defaultInput' S '"'
                      lookahead10(3072, 42); // Char | '"'
                      break;
                    case 2858:      // 'note' S 'over' S 'Agent' L 'defaultInput' S 'false'
                      lookahead10(3200, 0); // L
                      break;
                    case 2880:      // 'note' S 'over' S 'Agent' L 'defaultInput' S 'true'
                      lookahead10(3328, 0); // L
                      break;
                    case 2885:      // 'note' S 'over' S 'Agent' L 'defaultInput' S '{'
                      lookahead10(3456, 41); // Nchar | '}'
                      break;
                    }
                    break;
                  }
                  break;
                case 2605:          // 'note' S 'over' S 'Agent' L 'get'
                  lookahead8(3584, 1); // S
                  switch (lk) {
                  case 3587:        // 'note' S 'over' S 'Agent' L 'get' S
                    lookahead9(3712, 47); // 'property' | 'variable'
                    switch (lk) {
                    case 3769:      // 'note' S 'over' S 'Agent' L 'get' S 'property'
                      lookahead10(3840, 1); // S
                      break;
                    case 3777:      // 'note' S 'over' S 'Agent' L 'get' S 'variable'
                      lookahead10(3968, 1); // S
                      break;
                    }
                    break;
                  }
                  break;
                case 2621:          // 'note' S 'over' S 'Agent' L 'set'
                  lookahead8(4096, 1); // S
                  break;
                }
                break;
              case 2443:            // 'note' S 'over' S 'Agent' '"'
                lookahead7(4608, 0); // L
                switch (lk) {
                case 4610:          // 'note' S 'over' S 'Agent' '"' L
                  lookahead8(4736, 53); // 'defaultInput' | 'get' | 'set'
                  switch (lk) {
                  case 4773:        // 'note' S 'over' S 'Agent' '"' L 'defaultInput'
                    lookahead9(4864, 1); // S
                    switch (lk) {
                    case 4867:      // 'note' S 'over' S 'Agent' '"' L 'defaultInput' S
                      lookahead10(4992, 59); // Nr | '"' | 'false' | 'true' | '{'
                      break;
                    }
                    break;
                  case 4781:        // 'note' S 'over' S 'Agent' '"' L 'get'
                    lookahead9(5120, 1); // S
                    switch (lk) {
                    case 5123:      // 'note' S 'over' S 'Agent' '"' L 'get' S
                      lookahead10(5248, 47); // 'property' | 'variable'
                      break;
                    }
                    break;
                  case 4797:        // 'note' S 'over' S 'Agent' '"' L 'set'
                    lookahead9(5376, 1); // S
                    break;
                  }
                  break;
                }
                break;
              }
              break;
            }
            break;
          }
          break;
        }
        break;
      }
      break;
    default:
      lk = l1;
    }
    if (lk != 12                    // '"Agent"'
     && lk != 38                    // 'else'
     && lk != 40) {
      lk = memoized(1, e0);
      if (lk == 0) {
        var b0A = b0; var e0A = e0; var l1A = l1;
        var b1A = b1; var e1A = e1; var l2A = l2;
        var b2A = b2; var e2A = e2; var l3A = l3;
        var b3A = b3; var e3A = e3; var l4A = l4;
        var b4A = b4; var e4A = e4; var l5A = l5;
        var b5A = b5; var e5A = e5; var l6A = l6;
        var b6A = b6; var e6A = e6; var l7A = l7;
        var b7A = b7; var e7A = e7; var l8A = l8;
        var b8A = b8; var e8A = e8; var l9A = l9;
        var b9A = b9; var e9A = e9; var l10A = l10;
        var b10A = b10; var e10A = e10;
        try {
          try_getset();
          lk = -1;
        } catch (p1A) {
          lk = -2;
        }
        b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A; } else {
        b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A; } else {
        b2 = b2A; e2 = e2A; l3 = l3A; if (l3 == 0) {end = e2A; } else {
        b3 = b3A; e3 = e3A; l4 = l4A; if (l4 == 0) {end = e3A; } else {
        b4 = b4A; e4 = e4A; l5 = l5A; if (l5 == 0) {end = e4A; } else {
        b5 = b5A; e5 = e5A; l6 = l6A; if (l6 == 0) {end = e5A; } else {
        b6 = b6A; e6 = e6A; l7 = l7A; if (l7 == 0) {end = e6A; } else {
        b7 = b7A; e7 = e7A; l8 = l8A; if (l8 == 0) {end = e7A; } else {
        b8 = b8A; e8 = e8A; l9 = l9A; if (l9 == 0) {end = e8A; } else {
        b9 = b9A; e9 = e9A; l10 = l10A; if (l10 == 0) {end = e9A; } else {
        b10 = b10A; e10 = e10A; end = e10A; }}}}}}}}}}
        memoize(1, e0, lk);
      }
    }
    if (lk == -1) {
      parse_getset();
    }
  }

  function parse_interactionPre() {
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(14);                 // '->'
    consume(18);                    // '->'
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_interactionTo();
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
  }

  function parse_receiveRead() {
    consume(58);                    // 'readProperty:'
    parse_receiveMiddle();
    parse_readResponse();
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_deactTo();
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_receiveSubs() {
    consume(63);                    // 'subscribeEvent:'
    parse_receiveSubsObsPost();
  }

  function parse_receiveObs() {
    consume(52);                    // 'observeProperty:'
    parse_receiveSubsObsPost();
  }

  function parse_receiveInv() {
    consume(47);                    // 'invokeAction:'
    parse_receiveMiddle();
    parse_invConfirmation();
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_deactTo();
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_receiveSubsObsPost() {
    parse_receiveMiddle();
    parse_subsObsConfirmation();
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_subsObsData();
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_receiveMiddle() {
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_interactionName();
    lookahead1(0);                  // L
    consume(2);                     // L
    parse_actTo();
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_sendWrite() {
    consume(67);                    // 'writeProperty:'
  }

  function parse_sendInv() {
    consume(47);                    // 'invokeAction:'
  }

  function parse_sendPost() {
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_interactionName();
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function parse_readResponse() {
    parse_interactionTo();
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(12);                 // '-'
    consume(16);                    // '-'
    lookahead1(14);                 // '->'
    consume(18);                    // '->'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(34);                 // 'response'
    consume(60);                    // 'response'
  }

  function parse_subsObsConfirmation() {
    parse_interactionTo();
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(13);                 // '-->'
    consume(17);                    // '-->'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(24);                 // 'confirmation'
    consume(34);                    // 'confirmation'
  }

  function parse_subsObsData() {
    parse_interactionTo();
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(14);                 // '->'
    consume(18);                    // '->'
    lookahead1(18);                 // '>'
    consume(22);                    // '>'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(25);                 // 'data-pushed'
    consume(35);                    // 'data-pushed'
  }

  function parse_invConfirmation() {
    parse_interactionTo();
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(12);                 // '-'
    consume(16);                    // '-'
    lookahead1(14);                 // '->'
    consume(18);                    // '->'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(8);                  // '"Agent"'
    consume(12);                    // '"Agent"'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(30);                 // 'output'
    consume(54);                    // 'output'
  }

  function parse_actTo() {
    lookahead1(23);                 // 'activate'
    consume(29);                    // 'activate'
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_interactionTo();
  }

  function parse_deactTo() {
    lookahead1(26);                 // 'deactivate'
    consume(36);                    // 'deactivate'
    lookahead1(1);                  // S
    consume(3);                     // S
    parse_interactionTo();
  }

  function parse_interactionTo() {
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
    lookahead1(3);                  // Ntitle
    consume(5);                     // Ntitle
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
  }

  function parse_interactionName() {
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
    lookahead1(3);                  // Ntitle
    consume(5);                     // Ntitle
    lookahead1(7);                  // '"'
    consume(11);                    // '"'
  }

  function parse_getset() {
    consume(51);                    // 'note'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(31);                 // 'over'
    consume(55);                    // 'over'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(43);                 // '"' | 'Agent'
    if (l1 == 11) {
      consume(11);                  // '"'
    }
    lookahead1(21);                 // 'Agent'
    consume(25);                    // 'Agent'
    lookahead1(39);                 // L | '"'
    if (l1 == 11) {
      consume(11);                  // '"'
    }
    lookahead1(0);                  // L
    consume(2);                     // L
    for (;;) {
      lookahead1(53);               // 'defaultInput' | 'get' | 'set'
      switch (l1) {
      case 37:                      // 'defaultInput'
        consume(37);                // 'defaultInput'
        lookahead1(1);              // S
        consume(3);                 // S
        lookahead1(59);             // Nr | '"' | 'false' | 'true' | '{'
        switch (l1) {
        case 64:                    // 'true'
          consume(64);              // 'true'
          break;
        case 42:                    // 'false'
          consume(42);              // 'false'
          break;
        case 11:                    // '"'
          consume(11);              // '"'
          for (;;) {
            lookahead1(42);         // Char | '"'
            if (l1 != 9) {
              break;
            }
            consume(9);             // Char
          }
          consume(11);              // '"'
          break;
        case 10:                    // Nr
          consume(10);              // Nr
          break;
        default:
          consume(69);              // '{'
          for (;;) {
            lookahead1(41);         // Nchar | '}'
            if (l1 != 6) {
              break;
            }
            consume(6);             // Nchar
          }
          consume(70);              // '}'
        }
        break;
      default:
        switch (l1) {
        case 45:                    // 'get'
          consume(45);              // 'get'
          break;
        default:
          consume(61);              // 'set'
        }
        lookahead1(1);              // S
        consume(3);                 // S
        lookahead1(47);             // 'property' | 'variable'
        switch (l1) {
        case 65:                    // 'variable'
          consume(65);              // 'variable'
          break;
        default:
          consume(57);              // 'property'
        }
        lookahead1(1);              // S
        consume(3);                 // S
        lookahead1(5);              // VarName
        consume(8);                 // VarName
      }
      lookahead1(0);                // L
      consume(2);                   // L
      lookahead1(57);               // 'defaultInput' | 'end' | 'get' | 'set'
      if (l1 == 40) {
        break;
      }
    }
    consume(40);                    // 'end'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(29);                 // 'note'
    consume(51);                    // 'note'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function try_getset() {
    consumeT(51);                   // 'note'
    lookahead1(1);                  // S
    consumeT(3);                    // S
    lookahead1(31);                 // 'over'
    consumeT(55);                   // 'over'
    lookahead1(1);                  // S
    consumeT(3);                    // S
    lookahead1(43);                 // '"' | 'Agent'
    if (l1 == 11) {
      consumeT(11);                 // '"'
    }
    lookahead1(21);                 // 'Agent'
    consumeT(25);                   // 'Agent'
    lookahead1(39);                 // L | '"'
    if (l1 == 11) {
      consumeT(11);                 // '"'
    }
    lookahead1(0);                  // L
    consumeT(2);                    // L
    for (;;) {
      lookahead1(53);               // 'defaultInput' | 'get' | 'set'
      switch (l1) {
      case 37:                      // 'defaultInput'
        consumeT(37);               // 'defaultInput'
        lookahead1(1);              // S
        consumeT(3);                // S
        lookahead1(59);             // Nr | '"' | 'false' | 'true' | '{'
        switch (l1) {
        case 64:                    // 'true'
          consumeT(64);             // 'true'
          break;
        case 42:                    // 'false'
          consumeT(42);             // 'false'
          break;
        case 11:                    // '"'
          consumeT(11);             // '"'
          for (;;) {
            lookahead1(42);         // Char | '"'
            if (l1 != 9) {
              break;
            }
            consumeT(9);            // Char
          }
          consumeT(11);             // '"'
          break;
        case 10:                    // Nr
          consumeT(10);             // Nr
          break;
        default:
          consumeT(69);             // '{'
          for (;;) {
            lookahead1(41);         // Nchar | '}'
            if (l1 != 6) {
              break;
            }
            consumeT(6);            // Nchar
          }
          consumeT(70);             // '}'
        }
        break;
      default:
        switch (l1) {
        case 45:                    // 'get'
          consumeT(45);             // 'get'
          break;
        default:
          consumeT(61);             // 'set'
        }
        lookahead1(1);              // S
        consumeT(3);                // S
        lookahead1(47);             // 'property' | 'variable'
        switch (l1) {
        case 65:                    // 'variable'
          consumeT(65);             // 'variable'
          break;
        default:
          consumeT(57);             // 'property'
        }
        lookahead1(1);              // S
        consumeT(3);                // S
        lookahead1(5);              // VarName
        consumeT(8);                // VarName
      }
      lookahead1(0);                // L
      consumeT(2);                  // L
      lookahead1(57);               // 'defaultInput' | 'end' | 'get' | 'set'
      if (l1 == 40) {
        break;
      }
    }
    consumeT(40);                   // 'end'
    lookahead1(1);                  // S
    consumeT(3);                    // S
    lookahead1(29);                 // 'note'
    consumeT(51);                   // 'note'
    lookahead1(0);                  // L
    consumeT(2);                    // L
  }

  function parse_ref() {
    consume(59);                    // 'ref'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(31);                 // 'over'
    consume(55);                    // 'over'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(43);                 // '"' | 'Agent'
    if (l1 == 11) {
      consume(11);                  // '"'
    }
    lookahead1(21);                 // 'Agent'
    consume(25);                    // 'Agent'
    lookahead1(39);                 // L | '"'
    if (l1 == 11) {
      consume(11);                  // '"'
    }
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(45);                 // 'action' | 'function'
    switch (l1) {
    case 44:                        // 'function'
      consume(44);                  // 'function'
      break;
    default:
      consume(28);                  // 'action'
    }
    lookahead1(16);                 // ':'
    consume(20);                    // ':'
    lookahead1(5);                  // VarName
    consume(8);                     // VarName
    lookahead1(0);                  // L
    consume(2);                     // L
    lookahead1(27);                 // 'end'
    consume(40);                    // 'end'
    lookahead1(1);                  // S
    consume(3);                     // S
    lookahead1(33);                 // 'ref'
    consume(59);                    // 'ref'
    lookahead1(0);                  // L
    consume(2);                     // L
  }

  function consume(t) {
    if (l1 == t) {
      b0 = b1; e0 = e1; l1 = l2; if (l1 != 0) {
      b1 = b2; e1 = e2; l2 = l3; if (l2 != 0) {
      b2 = b3; e2 = e3; l3 = l4; if (l3 != 0) {
      b3 = b4; e3 = e4; l4 = l5; if (l4 != 0) {
      b4 = b5; e4 = e5; l5 = l6; if (l5 != 0) {
      b5 = b6; e5 = e6; l6 = l7; if (l6 != 0) {
      b6 = b7; e6 = e7; l7 = l8; if (l7 != 0) {
      b7 = b8; e7 = e8; l8 = l9; if (l8 != 0) {
      b8 = b9; e8 = e9; l9 = l10; if (l9 != 0) {
      b9 = b10; e9 = e10; l10 = 0; }}}}}}}}}
    } else {
      error(b1, e1, 0, l1, t);
    }
  }

  function consumeT(t) {
    if (l1 == t) {
      b0 = b1; e0 = e1; l1 = l2; if (l1 != 0) {
      b1 = b2; e1 = e2; l2 = l3; if (l2 != 0) {
      b2 = b3; e2 = e3; l3 = l4; if (l3 != 0) {
      b3 = b4; e3 = e4; l4 = l5; if (l4 != 0) {
      b4 = b5; e4 = e5; l5 = l6; if (l5 != 0) {
      b5 = b6; e5 = e6; l6 = l7; if (l6 != 0) {
      b6 = b7; e6 = e7; l7 = l8; if (l7 != 0) {
      b7 = b8; e7 = e8; l8 = l9; if (l8 != 0) {
      b8 = b9; e8 = e9; l9 = l10; if (l9 != 0) {
      b9 = b10; e9 = e10; l10 = 0; }}}}}}}}}
    } else {
      error(b1, e1, 0, l1, t);
    }
  }

  function lookahead1(set) {
    if (l1 == 0) {
      l1 = match(set);
      b1 = begin;
      e1 = end;
    }
  }

  function lookahead2(prefix, set) {
    if (l2 == 0) {
      l2 = match(set);
      b2 = begin;
      e2 = end;
    }
    lk = prefix + l2;
  }

  function lookahead3(prefix, set) {
    if (l3 == 0) {
      l3 = match(set);
      b3 = begin;
      e3 = end;
    }
    lk = prefix + l3;
  }

  function lookahead4(prefix, set) {
    if (l4 == 0) {
      l4 = match(set);
      b4 = begin;
      e4 = end;
    }
    lk = prefix + l4;
  }

  function lookahead5(prefix, set) {
    if (l5 == 0) {
      l5 = match(set);
      b5 = begin;
      e5 = end;
    }
    lk = prefix + l5;
  }

  function lookahead6(prefix, set) {
    if (l6 == 0) {
      l6 = match(set);
      b6 = begin;
      e6 = end;
    }
    lk = prefix + l6;
  }

  function lookahead7(prefix, set) {
    if (l7 == 0) {
      l7 = match(set);
      b7 = begin;
      e7 = end;
    }
    lk = prefix + l7;
  }

  function lookahead8(prefix, set) {
    if (l8 == 0) {
      l8 = match(set);
      b8 = begin;
      e8 = end;
    }
    lk = prefix + l8;
  }

  function lookahead9(prefix, set) {
    if (l9 == 0) {
      l9 = match(set);
      b9 = begin;
      e9 = end;
    }
    lk = prefix + l9;
  }

  function lookahead10(prefix, set) {
    if (l10 == 0) {
      l10 = match(set);
      b10 = begin;
      e10 = end;
    }
    lk = prefix + l10;
  }

  function error(b, e, s, l, t) {
    if (e >= ex) {
      bx = b;
      ex = e;
      sx = s;
      lx = l;
      tx = t;
    }
    throw new thisParser.ParseException(bx, ex, sx, lx, tx);
  }

  var lk, b0, e0;
  var l1, b1, e1;
  var l2, b2, e2;
  var l3, b3, e3;
  var l4, b4, e4;
  var l5, b5, e5;
  var l6, b6, e6;
  var l7, b7, e7;
  var l8, b8, e8;
  var l9, b9, e9;
  var l10, b10, e10;
  var bx, ex, sx, lx, tx;
  var memo;

  function memoize(i, e, v) {
    memo[(e << 1) + i] = v;
  }

  function memoized(i, e) {
    var v = memo[(e << 1) + i];
    return typeof v != 'undefined' ? v : 0;
  }

  var input;
  var size;

  var begin;
  var end;

  function match(tokenSetId) {
    begin = end;
    var current = end;
    var result = validateSeqD.INITIAL[tokenSetId];
    var state = 0;

    for (var code = result & 511; code != 0; ) {
      var charclass;
      var c0 = current < size ? input.charCodeAt(current) : 0;
      ++current;
      if (c0 < 0x80) {
        charclass = validateSeqD.MAP0[c0];
      } else if (c0 < 0xd800) {
        var c1: any = c0 >> 5;
        charclass = validateSeqD.MAP1[(c0 & 31) + validateSeqD.MAP1[(c1 & 31) + validateSeqD.MAP1[c1 >> 5]]];
      } else {
        if (c0 < 0xdc00) {
          var c1 = current < size ? input.charCodeAt(current) : 0;
          if (c1 >= 0xdc00 && c1 < 0xe000) {
            ++current;
            c0 = ((c0 & 0x3ff) << 10) + (c1 & 0x3ff) + 0x10000;
          }
        }

        var lo = 0, hi = 1;
        for (var m = 1; ; m = (hi + lo) >> 1) {
          if (validateSeqD.MAP2[m] > c0) hi = m - 1;
          else if (validateSeqD.MAP2[2 + m] < c0) lo = m + 1;
          else {charclass = validateSeqD.MAP2[4 + m]; break; }
          if (lo > hi) {charclass = 0; break; }
        }
      }

      state = code;
      var i0 = (charclass << 9) + code - 1;
      code = validateSeqD.TRANSITION[(i0 & 15) + validateSeqD.TRANSITION[i0 >> 4]];

      if (code > 511) {
        result = code;
        code &= 511;
        end = current;
      }
    }

    result >>= 9;
    if (result == 0) {
      end = current - 1;
      var c1 = end < size ? input.charCodeAt(end) : 0;
      if (c1 >= 0xdc00 && c1 < 0xe000) --end;
      return error(begin, end, state, -1, -1);
    }

    if (end > size) end = size;
    return (result & 127) - 1;
  }

}

validateSeqD.getTokenSet = function(tokenSetId) {
  var set: any[] = [];
  var s = tokenSetId < 0 ? - tokenSetId : validateSeqD.INITIAL[tokenSetId] & 511;
  for (var i = 0; i < 71; i += 32) {
    var j = i;
    var i0 = (i >> 5) * 362 + s - 1;
    var i1 = i0 >> 1;
    var f = validateSeqD.EXPECTED[(i0 & 1) + validateSeqD.EXPECTED[(i1 & 3) + validateSeqD.EXPECTED[i1 >> 2]]];
    for ( ; f != 0; f >>>= 1, ++j) {
      if ((f & 1) != 0) {
        set.push(validateSeqD.TOKEN[j]);
      }
    }
  }
  return set;
};

validateSeqD.MAP0 =
[
  /*   0 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 3,
  /*  36 */ 3, 3, 3, 3, 5, 6, 3, 3, 7, 8, 9, 3, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 3, 12, 13, 14, 3, 15, 16,
  /*  66 */ 17, 17, 17, 18, 17, 17, 17, 19, 17, 17, 17, 17, 17, 20, 21, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 22, 3,
  /*  93 */ 3, 3, 23, 3, 24, 25, 26, 27, 28, 29, 30, 31, 32, 17, 33, 34, 35, 36, 37, 38, 17, 39, 40, 41, 42, 43, 44, 45,
  /* 121 */ 46, 17, 47, 3, 48, 3, 3
];

validateSeqD.MAP1 =
[
  /*   0 */ 54, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58,
  /*  27 */ 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58,
  /*  54 */ 90, 122, 215, 153, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183,
  /*  76 */ 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 183, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 1, 0,
  /* 102 */ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 3, 3, 3, 3, 3, 5, 6, 3, 3, 7, 8, 9, 3,
  /* 138 */ 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 3, 12, 13, 14, 3, 24, 25, 26, 27, 28, 29, 30, 31, 32, 17, 33,
  /* 165 */ 34, 35, 36, 37, 38, 17, 39, 40, 41, 42, 43, 44, 45, 46, 17, 47, 3, 48, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  /* 195 */ 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 15, 16, 17, 17, 17, 18, 17, 17, 17, 19, 17, 17,
  /* 227 */ 17, 17, 17, 20, 21, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 22, 3, 3, 3, 23
];

validateSeqD.MAP2 =
[
  /* 0 */ 57344, 65536, 65533, 1114111, 3, 3
];

validateSeqD.INITIAL =
[
  /*  0 */ 1, 2, 3, 4, 5, 6, 5639, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  /* 29 */ 30, 31, 32, 33, 34, 35, 36, 37, 38, 1045, 39, 40, 41, 42, 43, 44, 45, 46, 47, 1072, 49, 5682, 51, 52, 53, 54,
  /* 55 */ 55, 56, 57, 58, 5691, 60, 5693, 62, 63, 64, 65, 66
];

validateSeqD.TRANSITION =
[
  /*    0 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*   18 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4291, 4292, 4276, 4286,
  /*   36 */ 4289, 4292, 2421, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*   54 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1600, 4292, 3701, 1618, 1634, 4292, 4008, 2439,
  /*   72 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3476, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*   90 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3609, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  108 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  126 */ 4292, 4292, 4607, 4292, 2178, 1653, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  144 */ 4292, 4317, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1898, 4292,
  /*  162 */ 3609, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2259, 4292, 4292, 4292, 1690, 4292, 4292,
  /*  180 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3014, 4292, 1941, 1712, 4506, 4292,
  /*  198 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  216 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4435, 4292, 4085, 1734, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  234 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  252 */ 4292, 4292, 4292, 4292, 4183, 4292, 3609, 4292, 1756, 4292, 4292, 4292, 4292, 4292, 4292, 1795, 4292, 4292,
  /*  270 */ 2649, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  288 */ 4293, 4292, 3609, 1637, 1813, 1831, 4292, 4292, 3962, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  306 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1891, 4292, 3609, 1848,
  /*  324 */ 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  342 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1914, 3609, 4292, 4292, 4292, 4292, 4292,
  /*  360 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1797, 1931, 4292, 4292, 4292,
  /*  378 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3609, 4292, 4292, 4292, 4292, 3373, 4292, 4292, 4292, 4292,
  /*  396 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  414 */ 4292, 4292, 4292, 1959, 3609, 1957, 4292, 1977, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  432 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1995,
  /*  450 */ 3609, 4292, 4523, 4292, 4292, 4292, 2340, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  468 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2014, 4394, 4292, 4292, 4292,
  /*  486 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  504 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 2951, 4129, 4292, 2057, 4292, 4292, 4292, 1863, 4292,
  /*  522 */ 4292, 1861, 4292, 4292, 4292, 4292, 4292, 4292, 2086, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  540 */ 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292,
  /*  558 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  576 */ 2035, 4292, 3609, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  594 */ 4292, 4292, 4358, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292,
  /*  612 */ 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4479, 4292, 4292,
  /*  630 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292, 1879, 4292, 4292, 4292,
  /*  648 */ 1863, 4292, 4292, 1861, 4292, 3455, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  666 */ 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861,
  /*  684 */ 4292, 4292, 4292, 3549, 3575, 4292, 4292, 2802, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  702 */ 4292, 4292, 4292, 2467, 3609, 4292, 2104, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  720 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  738 */ 3609, 4292, 2122, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  756 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2144, 4616, 3409, 2584, 2166, 2221,
  /*  774 */ 2212, 4178, 2237, 4292, 2189, 3315, 3353, 4292, 2088, 4292, 2275, 4292, 2277, 2293, 4292, 4292, 4292, 4292,
  /*  792 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4034, 1879, 4292, 4292, 2310, 1863, 4292,
  /*  810 */ 3667, 1861, 4292, 4292, 4292, 4292, 3495, 4292, 4292, 2150, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  828 */ 4292, 4292, 4292, 4292, 2035, 3970, 3609, 4292, 2328, 3008, 2363, 4292, 1863, 4292, 4292, 2070, 2611, 4292,
  /*  846 */ 3675, 3773, 4292, 4292, 4292, 2383, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  864 */ 2035, 2347, 3609, 2734, 1879, 4292, 4292, 4292, 2403, 4292, 4292, 3658, 4292, 2419, 4292, 4292, 4292, 4292,
  /*  882 */ 4292, 4292, 4292, 2437, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 3286, 3609, 2455,
  /*  900 */ 2490, 2525, 2541, 2581, 2600, 2634, 2670, 2690, 3990, 2706, 4414, 2502, 2041, 2878, 3050, 2759, 2782, 3554,
  /*  918 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2818, 4292, 1779, 2841, 1879, 4292, 4292, 4292,
  /*  936 */ 1863, 2901, 2922, 2854, 4292, 4292, 4292, 4582, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  954 */ 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 3154, 2939, 3281, 4292, 4292, 2973, 4292, 4292, 1861,
  /*  972 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /*  990 */ 4292, 4292, 2035, 4292, 3609, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 4292, 4292,
  /* 1008 */ 4292, 4292, 4292, 2312, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292,
  /* 1026 */ 3921, 2474, 1879, 4292, 4292, 4292, 1863, 2743, 4292, 2996, 3030, 4292, 3066, 4292, 3952, 4292, 2980, 4292,
  /* 1044 */ 3878, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292, 1879, 4292,
  /* 1062 */ 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 3430, 3086, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1080 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 3089, 3105, 4292, 4292, 3140, 3194, 4292,
  /* 1098 */ 4624, 1861, 4292, 4292, 4292, 4292, 2294, 3518, 4554, 2906, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1116 */ 4292, 4292, 4292, 4292, 2035, 2367, 3609, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292,
  /* 1134 */ 4292, 1915, 4292, 2654, 2019, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1152 */ 2035, 1998, 3609, 3215, 3231, 2509, 3117, 3267, 3302, 2766, 4292, 2867, 4292, 1979, 4292, 2127, 4565, 4292,
  /* 1170 */ 4292, 3331, 3350, 4341, 3369, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 1815, 3609, 2196,
  /* 1188 */ 3389, 3178, 1718, 4487, 3425, 3629, 3199, 1861, 4574, 4105, 4208, 4292, 4292, 4292, 3446, 3471, 4148, 3492,
  /* 1206 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3511, 4292, 3534, 2387, 1879, 4292, 4292, 4292,
  /* 1224 */ 3570, 4292, 4292, 2252, 3591, 2794, 4292, 3601, 3625, 4292, 4292, 3124, 3645, 4386, 4292, 4292, 4292, 4292,
  /* 1242 */ 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3691, 2618, 3717, 4292, 2565, 3243, 1863, 3745, 4292, 1861,
  /* 1260 */ 3761, 4292, 3795, 3812, 3847, 3894, 3913, 4292, 3937, 3986, 4006, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1278 */ 4292, 4292, 2035, 4292, 4024, 3168, 1879, 4050, 4292, 4292, 1863, 3401, 1771, 4077, 4292, 4101, 4292, 4292,
  /* 1296 */ 4292, 2923, 3796, 3831, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4121, 4292,
  /* 1314 */ 3609, 1696, 1879, 4292, 4145, 1832, 4164, 4199, 4224, 1861, 4240, 4292, 4265, 2106, 4309, 4249, 4333, 3897,
  /* 1332 */ 4357, 4061, 1666, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292, 4374, 3070,
  /* 1350 */ 3826, 4410, 4430, 4292, 2825, 1861, 4292, 3729, 3041, 4451, 4292, 2957, 4292, 4292, 4292, 4470, 4292, 4292,
  /* 1368 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3251, 2674, 1879, 3334, 2885, 4292, 1863, 1740,
  /* 1386 */ 4292, 1861, 4292, 4292, 4503, 4522, 4292, 4539, 4292, 4292, 4292, 3869, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1404 */ 4292, 4292, 4292, 4292, 2035, 4292, 2720, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292,
  /* 1422 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1440 */ 2035, 4292, 2555, 4292, 1879, 4292, 4292, 4292, 1863, 4292, 4292, 1861, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1458 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 2035, 4292, 3609, 4292,
  /* 1476 */ 1879, 4292, 4292, 4292, 1863, 4292, 1961, 1861, 4292, 4292, 1602, 4292, 4292, 4292, 2128, 3860, 4292, 4454,
  /* 1494 */ 4598, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 3609, 3779, 4292, 4292, 4292, 4292,
  /* 1512 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1530 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1674, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1548 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1566 */ 4292, 4292, 1600, 4292, 3701, 1618, 1634, 4292, 4008, 2439, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292,
  /* 1584 */ 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 4292, 1, 2050, 0,
  /* 1603 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21504, 2050, 0, 0, 0, 0, 2159, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2050,
  /* 1634 */ 0, 0, 1663, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 81, 0, 0, 0, 0, 77, 0, 0, 0, 77, 77, 0, 0, 6144, 77,
  /* 1665 */ 6144, 0, 0, 0, 0, 0, 360, 361, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36352, 5120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15872,
  /* 1694 */ 16896, 27648, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 118, 0, 118, 0, 0, 0, 7680, 0, 0, 7680, 0, 7680, 0, 0, 0, 0, 0,
  /* 1723 */ 0, 0, 0, 0, 0, 160, 0, 0, 0, 0, 0, 8192, 0, 0, 8192, 0, 8192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 0, 0, 0,
  /* 1754 */ 0, 0, 0, 0, 0, 0, 3141, 0, 0, 0, 0, 0, 0, 0, 0, 0, 135, 0, 0, 0, 0, 208, 209, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 1787 */ 3584, 5120, 0, 0, 101, 0, 0, 0, 0, 14336, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24576, 81, 81, 0, 0,
  /* 1817 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 93, 94, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 180, 0, 5639,
  /* 1850 */ 0, 0, 0, 0, 0, 0, 0, 0, 5639, 0, 5639, 0, 0, 0, 0, 0, 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 1882 */ 2628, 3141, 0, 0, 0, 0, 4682, 4682, 4682, 0, 0, 0, 0, 0, 0, 5639, 0, 0, 0, 0, 0, 0, 0, 0, 0, 78, 0, 0, 0,
  /* 1911 */ 0, 0, 0, 10752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 282, 0, 0, 30208, 0, 34816, 0, 0, 0, 32768,
  /* 1940 */ 27136, 0, 0, 0, 0, 0, 0, 0, 7680, 3584, 5120, 0, 7680, 0, 0, 0, 0, 0, 0, 0, 82, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 1970 */ 0, 0, 0, 0, 0, 217, 0, 0, 11264, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 11776, 0, 0, 0, 0,
  /* 2002 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 92, 0, 0, 0, 0, 0, 83, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 317, 0, 0, 0, 0,
  /* 2036 */ 0, 68, 69, 0, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 294, 0, 0, 0, 0, 2628, 3141, 0, 0, 0, 0,
  /* 2066 */ 4682, 4682, 4682, 134, 0, 0, 0, 0, 0, 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 230, 0, 0, 308, 0, 0, 0, 0, 0, 0, 0,
  /* 2095 */ 0, 0, 0, 0, 0, 0, 0, 270, 0, 0, 125, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 281, 0, 0, 0, 0, 0, 3141, 0,
  /* 2128 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4096, 0, 0, 0, 0, 0, 0, 68, 69, 70, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 2160 */ 326, 0, 0, 0, 0, 0, 119, 119, 0, 2628, 3141, 0, 0, 0, 0, 4682, 4740, 4682, 0, 0, 0, 0, 0, 0, 6144, 0, 3584,
  /* 2187 */ 6144, 6144, 0, 0, 0, 0, 0, 0, 210, 0, 0, 0, 0, 0, 0, 0, 0, 0, 114, 0, 0, 0, 0, 124, 124, 0, 0, 152, 0, 0,
  /* 2217 */ 0, 0, 0, 158, 0, 0, 0, 0, 0, 0, 0, 142, 0, 0, 0, 0, 0, 0, 148, 0, 0, 0, 0, 4682, 4682, 0, 0, 0, 0, 0, 0, 0,
  /* 2249 */ 0, 0, 191, 0, 0, 0, 0, 222, 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26112, 0, 0, 0, 0, 0, 0, 0, 284, 0, 0,
  /* 2279 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 318, 0, 320, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 295, 0, 166,
  /* 2312 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 329, 0, 0, 0, 0, 2628, 3141, 128, 0, 0, 0, 4682, 4682, 4682, 0,
  /* 2341 */ 0, 0, 0, 0, 0, 9216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 88, 89, 0, 0, 0, 0, 0, 0, 0, 0, 153, 0, 0, 0, 0, 0, 0, 0,
  /* 2374 */ 0, 0, 0, 0, 0, 91, 0, 0, 0, 0, 0, 0, 321, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 104, 0, 104, 104, 0, 0, 0,
  /* 2406 */ 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20992, 0, 245, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1603, 0,
  /* 2437 */ 0, 18432, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1663, 0, 0, 106, 90, 0, 0, 0, 90, 113, 90, 0, 0, 113,
  /* 2467 */ 0, 0, 0, 0, 0, 0, 13824, 0, 0, 0, 0, 0, 0, 0, 0, 0, 102, 0, 0, 0, 0, 0, 0, 90, 126, 0, 2628, 3141, 0, 0, 0,
  /* 2498 */ 0, 4682, 4682, 4682, 0, 0, 0, 0, 0, 0, 22016, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 0, 0, 0, 0, 0, 0, 0, 0, 137,
  /* 2528 */ 0, 0, 0, 0, 0, 143, 0, 0, 0, 0, 0, 0, 149, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 161, 162, 163, 0, 0, 0, 0, 0,
  /* 2560 */ 35328, 0, 0, 3584, 5120, 0, 0, 0, 0, 0, 0, 156, 157, 0, 0, 0, 0, 0, 0, 0, 164, 0, 0, 167, 0, 0, 0, 0, 0, 0,
  /* 2590 */ 0, 0, 0, 0, 0, 0, 0, 119, 122, 122, 0, 0, 0, 4682, 4682, 0, 0, 0, 0, 0, 187, 0, 0, 0, 0, 0, 0, 235, 0, 0,
  /* 2620 */ 0, 0, 0, 0, 0, 0, 0, 115, 0, 0, 0, 96, 0, 0, 0, 0, 194, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 204, 0, 0, 0, 0,
  /* 2653 */ 260, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 303, 0, 0, 0, 0, 0, 0, 207, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 2686 */ 105, 0, 105, 105, 219, 0, 0, 0, 0, 4682, 74, 223, 0, 0, 0, 0, 0, 0, 0, 26624, 244, 0, 0, 0, 33280, 0, 0, 0,
  /* 2714 */ 0, 0, 0, 252, 0, 254, 0, 0, 0, 0, 99, 0, 0, 0, 3584, 5120, 0, 0, 0, 103, 0, 0, 0, 0, 108, 0, 0, 0, 108, 0,
  /* 2744 */ 0, 0, 0, 0, 0, 0, 197, 0, 0, 0, 201, 0, 0, 0, 0, 0, 31232, 0, 0, 0, 0, 33792, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 2775 */ 199, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 335, 336, 20480, 0, 338, 18944, 0, 340, 0, 0, 0, 0, 0, 0, 25088, 0, 0,
  /* 2803 */ 0, 0, 0, 0, 0, 0, 0, 324, 0, 0, 0, 0, 0, 0, 0, 0, 0, 68, 69, 71, 4683, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 213,
  /* 2835 */ 0, 0, 0, 0, 0, 0, 0, 107, 0, 0, 0, 0, 0, 0, 0, 0, 117, 0, 117, 0, 0, 0, 0, 0, 4682, 4682, 0, 0, 0, 0, 0,
  /* 2866 */ 228, 0, 0, 0, 0, 0, 4682, 4682, 0, 0, 0, 226, 0, 0, 0, 0, 0, 0, 299, 0, 0, 0, 0, 0, 0, 0, 0, 0, 159, 0, 0,
  /* 2897 */ 0, 0, 0, 0, 0, 0, 0, 0, 30720, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12800, 0, 0, 0, 206, 0, 0, 0, 0, 0, 0,
  /* 2929 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 306, 120, 120, 0, 2628, 3141, 0, 0, 0, 0, 4682, 4682, 4682, 0, 0, 0, 0, 0, 85,
  /* 2957 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 301, 0, 0, 304, 0, 0, 0, 0, 0, 4682, 4682, 184, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 2989 */ 315, 0, 0, 0, 0, 0, 0, 0, 0, 0, 221, 0, 4682, 4682, 0, 0, 0, 0, 227, 0, 0, 0, 0, 0, 140, 0, 0, 0, 0, 0, 0,
  /* 3020 */ 0, 0, 0, 0, 7680, 0, 0, 0, 0, 0, 0, 0, 0, 233, 0, 234, 0, 0, 0, 0, 239, 0, 0, 0, 0, 0, 0, 262, 0, 0, 0, 0,
  /* 3052 */ 0, 0, 0, 0, 0, 313, 0, 0, 0, 0, 0, 15360, 0, 0, 0, 0, 0, 259, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 146, 0,
  /* 3084 */ 0, 0, 0, 0, 17408, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 121, 0, 0, 121, 121, 0, 2628, 3141, 0, 0, 0, 0,
  /* 3114 */ 4682, 4682, 4682, 0, 0, 0, 0, 0, 155, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 325, 0, 0, 0, 0, 0, 0, 165, 0, 0, 0, 0,
  /* 3145 */ 0, 171, 0, 0, 174, 0, 0, 0, 179, 0, 0, 0, 0, 109, 0, 0, 0, 109, 0, 0, 0, 0, 120, 0, 0, 0, 0, 110, 0, 0, 0,
  /* 3176 */ 110, 116, 0, 0, 0, 0, 0, 0, 141, 0, 0, 0, 0, 145, 0, 0, 0, 0, 0, 0, 0, 4790, 4682, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 3207 */ 0, 0, 0, 214, 215, 0, 0, 0, 0, 0, 92, 0, 0, 0, 92, 92, 0, 0, 0, 92, 0, 92, 123, 123, 92, 92, 0, 2628, 3141,
  /* 3236 */ 0, 0, 0, 0, 4682, 4682, 4682, 0, 0, 0, 0, 0, 170, 0, 172, 0, 0, 0, 0, 0, 0, 0, 0, 3584, 5120, 0, 0, 0, 0,
  /* 3265 */ 105, 0, 144, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 177, 0, 144, 0, 0, 0, 0, 139, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 3297 */ 90, 0, 0, 0, 0, 70, 0, 0, 4682, 4682, 0, 0, 0, 185, 0, 0, 0, 189, 0, 0, 0, 0, 0, 4682, 4682, 0, 0, 225, 0,
  /* 3326 */ 0, 0, 229, 0, 0, 0, 0, 23040, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 147, 0, 0, 0, 0, 333, 0, 0, 0, 0, 0,
  /* 3358 */ 0, 0, 0, 0, 0, 0, 0, 0, 242, 243, 0, 0, 0, 0, 359, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 178, 0, 0, 0, 0, 0,
  /* 3391 */ 0, 2628, 3141, 0, 0, 0, 131, 4682, 4682, 4682, 0, 0, 0, 0, 0, 195, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3584,
  /* 3418 */ 5120, 0, 0, 100, 0, 0, 0, 0, 181, 0, 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 267, 0, 0, 0, 0, 307, 0,
  /* 3448 */ 0, 0, 0, 0, 0, 0, 314, 0, 0, 0, 0, 0, 0, 0, 249, 250, 0, 251, 0, 0, 0, 0, 0, 0, 0, 0, 0, 322, 0, 0, 0, 0,
  /* 3480 */ 0, 0, 0, 0, 0, 0, 0, 279, 0, 0, 0, 0, 345, 0, 346, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 293, 0, 0, 0, 0,
  /* 3513 */ 68, 69, 72, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12288, 0, 0, 0, 0, 0, 0, 95, 0, 0, 0, 0, 0, 0, 0, 3584,
  /* 3543 */ 5120, 0, 0, 0, 0, 104, 0, 0, 0, 0, 274, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 354, 0, 356, 0, 0, 0, 4096,
  /* 3573 */ 4682, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 291, 0, 0, 0, 0, 231, 0, 232, 0, 0, 0, 0, 0, 0, 238, 0, 0, 0,
  /* 3604 */ 0, 0, 0, 0, 24064, 0, 0, 0, 0, 0, 0, 0, 0, 3584, 5120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 286, 0, 0, 0, 0, 0, 0, 0,
  /* 3636 */ 0, 0, 0, 0, 0, 202, 0, 0, 0, 0, 332, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 341, 0, 0, 0, 0, 0, 4682, 4682, 0, 224,
  /* 3667 */ 0, 0, 0, 0, 0, 0, 0, 211, 0, 0, 0, 0, 0, 0, 0, 0, 264, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 0, 0, 0, 0, 0, 3584,
  /* 3700 */ 5120, 0, 0, 0, 0, 0, 0, 1, 2050, 3584, 5120, 0, 0, 0, 0, 0, 1, 96, 96, 0, 2628, 3141, 0, 0, 130, 0, 4682,
  /* 3727 */ 4682, 4741, 0, 0, 0, 0, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 256, 0, 0, 0, 29184, 0, 0, 196, 0, 0, 0, 0, 0,
  /* 3757 */ 0, 203, 0, 205, 0, 28672, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 0, 0, 0, 0, 0, 275, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 3789 */ 35840, 0, 0, 0, 0, 0, 257, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 319, 0, 0, 0, 273, 0, 0, 0, 0, 0,
  /* 3821 */ 0, 0, 0, 0, 280, 0, 0, 0, 0, 154, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 327, 0, 0, 0, 0, 0, 0, 285, 0, 0, 0, 0,
  /* 3854 */ 0, 0, 0, 0, 0, 292, 0, 0, 0, 0, 0, 29696, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 351, 0, 0, 0, 0, 0, 0, 0, 0, 337,
  /* 3886 */ 0, 0, 339, 0, 0, 0, 0, 0, 0, 297, 298, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 328, 0, 330, 0, 0, 309, 0, 0,
  /* 3918 */ 22528, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3584, 5120, 0, 0, 0, 102, 0, 0, 0, 0, 0, 334, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 3949 */ 0, 0, 343, 0, 0, 0, 0, 287, 0, 0, 0, 0, 289, 0, 0, 0, 0, 0, 0, 0, 10240, 0, 0, 0, 0, 0, 0, 0, 0, 87, 0, 0,
  /* 3981 */ 0, 0, 0, 0, 0, 0, 0, 0, 347, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 241, 0, 0, 19968, 0, 358, 0, 0, 0, 0, 0,
  /* 4013 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2159, 0, 0, 0, 0, 98, 0, 0, 0, 0, 3584, 5120, 0, 0, 0, 0, 0, 0, 112, 0, 0, 0, 0,
  /* 4045 */ 112, 0, 0, 0, 0, 0, 0, 0, 138, 0, 0, 0, 0, 0, 0, 25600, 0, 0, 0, 0, 0, 0, 350, 0, 0, 0, 353, 19456, 0, 0,
  /* 4075 */ 0, 0, 0, 0, 220, 0, 0, 4791, 4682, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3584, 5120, 0, 8192, 0, 0, 0, 0, 0, 0, 246,
  /* 4104 */ 247, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 0, 0, 0, 0, 0, 68, 69, 73, 4684, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 4136 */ 0, 3584, 5120, 85, 0, 0, 0, 0, 0, 0, 151, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 342, 0, 0, 0, 0, 0,
  /* 4167 */ 4682, 4682, 0, 0, 0, 0, 186, 0, 188, 0, 190, 0, 0, 0, 0, 169, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8704, 79,
  /* 4197 */ 80, 0, 192, 193, 0, 0, 0, 0, 0, 0, 198, 0, 0, 0, 0, 0, 0, 0, 263, 0, 265, 0, 0, 0, 0, 0, 0, 0, 23552,
  /* 4226 */ 31744, 0, 0, 0, 0, 0, 0, 0, 16384, 0, 0, 0, 0, 218, 0, 0, 0, 0, 34304, 0, 0, 0, 237, 0, 0, 0, 0, 0, 0, 0,
  /* 4256 */ 300, 0, 0, 0, 302, 0, 0, 0, 0, 0, 13312, 0, 0, 0, 261, 0, 0, 0, 0, 266, 0, 0, 0, 0, 0, 0, 1603, 0, 3584,
  /* 4285 */ 5120, 0, 0, 0, 0, 0, 1603, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 81, 283, 0, 0, 0, 0, 28160, 0,
  /* 4316 */ 32256, 0, 0, 0, 0, 0, 0, 0, 0, 6656, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 310, 0, 0, 312, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 4348 */ 0, 17920, 352, 0, 0, 0, 0, 0, 0, 331, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 344, 0, 0, 0, 2628,
  /* 4378 */ 3141, 0, 129, 0, 0, 4682, 4682, 4682, 0, 0, 0, 0, 0, 349, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3584, 5120, 0, 0,
  /* 4406 */ 0, 0, 0, 84, 0, 0, 0, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 268, 269, 0, 0, 0, 0, 0, 4682, 4791, 0, 0,
  /* 4437 */ 0, 0, 0, 0, 0, 0, 0, 0, 0, 8192, 0, 0, 0, 0, 0, 272, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 355, 0, 0,
  /* 4470 */ 0, 0, 0, 0, 348, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 323, 0, 0, 0, 0, 0, 0, 0, 0, 173, 0, 176, 0, 0, 0, 0, 0,
  /* 4503 */ 0, 0, 258, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7168, 0, 0, 271, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  /* 4536 */ 0, 0, 9728, 296, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 305, 0, 0, 0, 0, 311, 0, 0, 0, 0, 0, 316, 0, 0, 0,
  /* 4568 */ 0, 0, 0, 288, 0, 14848, 0, 0, 0, 0, 0, 0, 0, 236, 0, 0, 0, 0, 0, 0, 0, 0, 276, 277, 278, 0, 0, 0, 0, 0,
  /* 4598 */ 357, 0, 0, 0, 0, 0, 0, 362, 0, 0, 0, 0, 0, 0, 0, 0, 6144, 77, 0, 0, 0, 0, 0, 0, 0, 86, 0, 0, 0, 0, 0, 0, 0,
  /* 4631 */ 0, 212, 0, 0, 0, 0, 216, 0, 0
];

validateSeqD.EXPECTED =
[
  /*   0 */ 136, 140, 144, 173, 360, 148, 152, 308, 156, 163, 167, 173, 272, 371, 185, 189, 159, 168, 173, 172, 173,
  /*  21 */ 187, 179, 168, 271, 173, 208, 252, 183, 273, 173, 193, 256, 172, 210, 255, 173, 212, 173, 249, 173, 173,
  /*  42 */ 173, 173, 173, 173, 173, 173, 241, 197, 355, 229, 202, 206, 173, 173, 242, 198, 282, 216, 264, 173, 174,
  /*  63 */ 222, 226, 233, 218, 237, 174, 246, 281, 261, 268, 376, 279, 286, 305, 175, 312, 316, 239, 321, 292, 320,
  /*  84 */ 332, 326, 325, 289, 330, 336, 340, 173, 173, 173, 173, 346, 298, 342, 350, 173, 173, 173, 257, 365, 173,
  /* 105 */ 354, 173, 173, 173, 295, 359, 352, 173, 173, 173, 364, 173, 370, 173, 173, 366, 173, 173, 300, 359, 173,
  /* 126 */ 274, 299, 173, 366, 301, 300, 300, 274, 275, 375, 380, 391, 413, 510, 405, 474, 407, 409, 513, 454, 415,
  /* 147 */ 419, 429, 431, 472, 448, 433, 438, 435, 404, 441, 400, 392, 412, 413, 403, 452, 413, 402, 405, 408, 410,
  /* 168 */ 455, 483, 382, 382, 472, 382, 382, 382, 382, 380, 521, 465, 398, 413, 403, 415, 397, 382, 382, 382, 447,
  /* 189 */ 480, 382, 464, 450, 481, 382, 412, 459, 454, 463, 467, 382, 425, 485, 487, 489, 491, 493, 495, 382, 382,
  /* 210 */ 382, 480, 382, 398, 461, 382, 385, 497, 446, 434, 473, 505, 401, 453, 455, 466, 481, 424, 475, 416, 417,
  /* 231 */ 470, 479, 477, 395, 420, 503, 500, 514, 393, 382, 382, 380, 401, 452, 454, 507, 454, 467, 382, 382, 456,
  /* 252 */ 382, 382, 412, 459, 461, 382, 382, 382, 388, 422, 445, 509, 473, 499, 501, 515, 505, 500, 411, 382, 382,
  /* 273 */ 471, 382, 382, 382, 381, 382, 522, 481, 425, 482, 476, 511, 396, 476, 511, 517, 446, 380, 475, 512, 446,
  /* 294 */ 393, 382, 387, 382, 389, 386, 382, 382, 382, 389, 382, 519, 383, 411, 382, 437, 440, 468, 467, 424, 475,
  /* 315 */ 416, 511, 445, 447, 524, 380, 526, 425, 482, 457, 399, 390, 475, 512, 446, 446, 530, 394, 445, 528, 387,
  /* 336 */ 532, 444, 446, 444, 534, 534, 382, 382, 382, 536, 400, 382, 423, 382, 538, 421, 382, 382, 383, 382, 382,
  /* 357 */ 382, 425, 385, 382, 382, 382, 427, 388, 382, 381, 386, 382, 382, 384, 382, 382, 382, 443, 381, 382, 382,
  /* 378 */ 387, 390, 4, 8, 0, 0, 1, 0, 2, 0, 4, 0, 8, 16, 32, 128, 0, 32, 8192, 536870912, 0, 128, 4, 16, 256, 256,
  /* 404 */ 4096, 4096, 8192, 65536, 131072, 262144, 524288, 2097152, 128, 128, 256, 16777216, 33554432, 0, 2560,
  /* 419 */ 67108864, 536870912, 2, 2, 64, 0, 4096, 32768, 2052, 16392, 64, 2560, 33556480, 49152, 49160, 1024, 0,
  /* 436 */ 49164, 3072, 4096, 2146304, 3072, -2146959360, -2012741632, 12, 0, 1048576, 67108864, 0x80000000, 0,
  /* 449 */ 16777220, 4, 128, 131072, 524288, 4194304, 8388608, 16777216, 0, 2048, 4096, 8388608, 16777216, 536870912,
  /* 463 */ 16777216, 134217728, 0, 134217728, 268435456, 1073741824, 1073741832, 524544, 0, 268435456, 0, 16384, 32768,
  /* 476 */ 0, 512, 2048, 536879136, 0, 1073741824, 0, 33554432, 536870912, 524546, 524608, 536879392, -2079293440,
  /* 489 */ 1024, 524610, 33555456, 134823936, 35913729, 35913729, 134824192, 134824320, 320, 1048576, 65536, 1, 262144,
  /* 502 */ 2097152, 64, 1048576, 65536, 0, 16, 524288, 0x80000000, 1024, 2048, 32, 1048576, 2097152, 0, 384, 2,
  /* 518 */ 1048576, 1024, 16384, 16, 4194304, 268435456, 1, 2097152, 16, 268435456, 0x80000000, 128, 4, 32768,
  /* 532 */ 0x80000000, 32768, 0x80000000, 1048576, 33, 0, 3, 0
];

validateSeqD.TOKEN =
[
  '(0)',
  'END',
  'L',
  'S',
  'Title',
  'Ntitle',
  'Nchar',
  'Diatype',
  'VarName',
  'Char',
  'Nr',
  '\'"\'',
  '\'"Agent"\'',
  '\'()\'',
  '\')\'',
  '\',\'',
  '\'-\'',
  '\'-->\'',
  '\'->\'',
  '\'...\'',
  '\':\'',
  '\'==\'',
  '\'>\'',
  '\'@enduml\'',
  '\'@startuml\'',
  '\'Agent\'',
  '\'[\'',
  '\'[<-\'',
  '\'action\'',
  '\'activate\'',
  '\'allOf(\'',
  '\'alt\'',
  '\'anyOf(\'',
  '\'break\'',
  '\'confirmation\'',
  '\'data-pushed\'',
  '\'deactivate\'',
  '\'defaultInput\'',
  '\'else\'',
  '\'else else\'',
  '\'end\'',
  '\'every\'',
  '\'false\'',
  '\'forever\'',
  '\'function\'',
  '\'get\'',
  '\'group\'',
  '\'invokeAction:\'',
  '\'loop\'',
  '\'ms\'',
  '\'not(\'',
  '\'note\'',
  '\'observeProperty:\'',
  '\'oneOf(\'',
  '\'output\'',
  '\'over\'',
  '\'par\'',
  '\'property\'',
  '\'readProperty:\'',
  '\'ref\'',
  '\'response\'',
  '\'set\'',
  '\'strict\'',
  '\'subscribeEvent:\'',
  '\'true\'',
  '\'variable\'',
  '\'wait\'',
  '\'writeProperty:\'',
  '\'x\'',
  '\'{\'',
  '\'}\''
];
// End

// ########### adapted ###########
export default function checkSeqD(mashup: string) {
  return new Promise( (res, rej) => {
    try {
      const umlParser = new validateSeqD(mashup);
      umlParser.parse_mashup();
    } catch (err: any) {
      DEBUG.e = err.getMessage();
      rej(DEBUG);
    }
    res('Uml is valid');
  });
}
// ########### - ###########
