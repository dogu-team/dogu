package com.dogu.deviceagent.control

/**
 * Decompose accented characters.
 *
 *
 * For example, [decompose(&#39;é&#39;)][.decompose] returns `"\u0301e"`.
 *
 *
 * This is useful for injecting key events to generate the expected character ([android.view.KeyCharacterMap.getEvents]
 * KeyCharacterMap.getEvents()} returns `null` with input `"é"` but works with input `"\u0301e"`).
 *
 *
 * See [diacritical dead key characters](https://source.android.com/devices/input/key-character-map-files#behaviors).
 */
object KeyComposition {
    private const val KEY_DEAD_GRAVE = "\u0300"
    private const val KEY_DEAD_ACUTE = "\u0301"
    private const val KEY_DEAD_CIRCUMFLEX = "\u0302"
    private const val KEY_DEAD_TILDE = "\u0303"
    private const val KEY_DEAD_UMLAUT = "\u0308"
    private val COMPOSITION_MAP = createDecompositionMap()
    fun decompose(c: Char): String? {
        return COMPOSITION_MAP[c]
    }

    private fun grave(c: Char): String {
        return KEY_DEAD_GRAVE + c
    }

    private fun acute(c: Char): String {
        return KEY_DEAD_ACUTE + c
    }

    private fun circumflex(c: Char): String {
        return KEY_DEAD_CIRCUMFLEX + c
    }

    private fun tilde(c: Char): String {
        return KEY_DEAD_TILDE + c
    }

    private fun umlaut(c: Char): String {
        return KEY_DEAD_UMLAUT + c
    }

    private fun createDecompositionMap(): Map<Char, String> {
        val map: MutableMap<Char, String> = HashMap()
        map['À'] = grave('A')
        map['È'] = grave('E')
        map['Ì'] = grave('I')
        map['Ò'] = grave('O')
        map['Ù'] = grave('U')
        map['à'] = grave('a')
        map['è'] = grave('e')
        map['ì'] = grave('i')
        map['ò'] = grave('o')
        map['ù'] = grave('u')
        map['Ǹ'] = grave('N')
        map['ǹ'] = grave('n')
        map['Ẁ'] = grave('W')
        map['ẁ'] = grave('w')
        map['Ỳ'] = grave('Y')
        map['ỳ'] = grave('y')
        map['Á'] = acute('A')
        map['É'] = acute('E')
        map['Í'] = acute('I')
        map['Ó'] = acute('O')
        map['Ú'] = acute('U')
        map['Ý'] = acute('Y')
        map['á'] = acute('a')
        map['é'] = acute('e')
        map['í'] = acute('i')
        map['ó'] = acute('o')
        map['ú'] = acute('u')
        map['ý'] = acute('y')
        map['Ć'] = acute('C')
        map['ć'] = acute('c')
        map['Ĺ'] = acute('L')
        map['ĺ'] = acute('l')
        map['Ń'] = acute('N')
        map['ń'] = acute('n')
        map['Ŕ'] = acute('R')
        map['ŕ'] = acute('r')
        map['Ś'] = acute('S')
        map['ś'] = acute('s')
        map['Ź'] = acute('Z')
        map['ź'] = acute('z')
        map['Ǵ'] = acute('G')
        map['ǵ'] = acute('g')
        map['Ḉ'] = acute('Ç')
        map['ḉ'] = acute('ç')
        map['Ḱ'] = acute('K')
        map['ḱ'] = acute('k')
        map['Ḿ'] = acute('M')
        map['ḿ'] = acute('m')
        map['Ṕ'] = acute('P')
        map['ṕ'] = acute('p')
        map['Ẃ'] = acute('W')
        map['ẃ'] = acute('w')
        map['Â'] = circumflex('A')
        map['Ê'] = circumflex('E')
        map['Î'] = circumflex('I')
        map['Ô'] = circumflex('O')
        map['Û'] = circumflex('U')
        map['â'] = circumflex('a')
        map['ê'] = circumflex('e')
        map['î'] = circumflex('i')
        map['ô'] = circumflex('o')
        map['û'] = circumflex('u')
        map['Ĉ'] = circumflex('C')
        map['ĉ'] = circumflex('c')
        map['Ĝ'] = circumflex('G')
        map['ĝ'] = circumflex('g')
        map['Ĥ'] = circumflex('H')
        map['ĥ'] = circumflex('h')
        map['Ĵ'] = circumflex('J')
        map['ĵ'] = circumflex('j')
        map['Ŝ'] = circumflex('S')
        map['ŝ'] = circumflex('s')
        map['Ŵ'] = circumflex('W')
        map['ŵ'] = circumflex('w')
        map['Ŷ'] = circumflex('Y')
        map['ŷ'] = circumflex('y')
        map['Ẑ'] = circumflex('Z')
        map['ẑ'] = circumflex('z')
        map['Ã'] = tilde('A')
        map['Ñ'] = tilde('N')
        map['Õ'] = tilde('O')
        map['ã'] = tilde('a')
        map['ñ'] = tilde('n')
        map['õ'] = tilde('o')
        map['Ĩ'] = tilde('I')
        map['ĩ'] = tilde('i')
        map['Ũ'] = tilde('U')
        map['ũ'] = tilde('u')
        map['Ẽ'] = tilde('E')
        map['ẽ'] = tilde('e')
        map['Ỹ'] = tilde('Y')
        map['ỹ'] = tilde('y')
        map['Ä'] = umlaut('A')
        map['Ë'] = umlaut('E')
        map['Ï'] = umlaut('I')
        map['Ö'] = umlaut('O')
        map['Ü'] = umlaut('U')
        map['ä'] = umlaut('a')
        map['ë'] = umlaut('e')
        map['ï'] = umlaut('i')
        map['ö'] = umlaut('o')
        map['ü'] = umlaut('u')
        map['ÿ'] = umlaut('y')
        map['Ÿ'] = umlaut('Y')
        map['Ḧ'] = umlaut('H')
        map['ḧ'] = umlaut('h')
        map['Ẅ'] = umlaut('W')
        map['ẅ'] = umlaut('w')
        map['Ẍ'] = umlaut('X')
        map['ẍ'] = umlaut('x')
        map['ẗ'] = umlaut('t')
        return map
    }
}
