# pytest-dogu-report

## initial settings

1. install pyenv

   - macos [link](https://github.com/pyenv/pyenv#homebrew-in-macos)
   - windows [link](https://github.com/pyenv-win/pyenv-win/blob/master/docs/installation.md#installation)

2. install python 3.9.13

   - macos

   ```shell
   brew install openssl
   CONFIGURE_OPTS="-with-openssl=/opt/homebrew/opt/openssl" pyenv install 3.9.13
   pyenv global 3.9.13
   ```

   - windows

   ```shell
   pyenv install 3.9.13
   pyenv global 3.9.13
   ```

3. put the script below in your shell runtime config file (e.g. ~/.zshrc)

   ```shell
   eval "$(pyenv init -)"
   ```

4. install poetry 1.5.1

   ```shell
   pip install poetry==1.5.1
   ```

5. install dependencies

   ```shell
   yarn newbie
   ```
