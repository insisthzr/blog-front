#!/usr/local/bin/python3
from fabric.api import run, env, local, cd, put

env.hosts = ['47.52.69.7']
env.user = 'root'


def dev():
    local("tar -Jcv -f blog.tar.xz *.html *.css *.js")
    with cd('/mnt/code/blog-front'):
        put('blog.tar.xz', 'blog.tar.xz')
        run('tar -Jxv -f blog.tar.xz')
        run('rm blog.tar.xz')
    local('rm -rf blog.tar.xz')
