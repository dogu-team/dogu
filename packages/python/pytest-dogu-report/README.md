# pytest-dogu-report

## initial settings

1. install pyenv

   1. install

   - macos [link](https://github.com/pyenv/pyenv#homebrew-in-macos)
   - windows [link](https://github.com/pyenv-win/pyenv-win/blob/master/docs/installation.md#installation)

   2. check if pyenv is installed correctly

      ```shell
      pyenv --version
      # pyenv x.y.z
      ```

2. install python 3.9.13

   1. install

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

   2. check if python 3.9.13 is installed correctly

      ```shell
      python --version
      # Python 3.9.13

      pip --version
      # pip x.y.z from {your-home}/.pyenv/versions/3.9.13/lib/python3.9/site-packages/pip (python 3.9)
      ```

3. update shell runtime config file

   1. using **zsh**

      1. append to runtime config file

         ```shell
         echo 'eval "$(pyenv init -)"' >> ~/.zshrc
         ```

      2. apply to current shell

         ```
         source ~/.zshrc
         ```

   2. using **bash**

      1. append to runtime config file

         ```shell
         echo 'eval "$(pyenv init -)"' >> ~/.bashrc
         ```

      2. apply to current shell

         ```
         source ~/.bashrc
         ```

4. install poetry 1.5.1

   1. install

      ```shell
      pip install poetry==1.5.1
      ```

   2. check if poetry is installed correctly

      ```shell
      poetry --version
      # Poetry (version 1.5.1)
      ```

5. install dependencies

   ```shell
   yarn newbie
   ```
