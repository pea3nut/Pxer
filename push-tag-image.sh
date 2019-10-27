if [ -n "$TRAVIS_TAG" ] ;then
    echo "push a image for tag pea3nut/pxer:$TRAVIS_TAG"
    docker tag "pea3nut/pxer:${TRAVIS_BRANCH}" "pea3nut/pxer:${TRAVIS_TAG}"
    docker push "pea3nut/pxer:${TRAVIS_TAG}"
fi
