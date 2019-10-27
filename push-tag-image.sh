if [ -n "$TRAVIS_TAG" ] ;then
    echo "push a image for tag $TRAVIS_TAG"
    docker tag "pea3nut/pxer:${TRAVIS_COMMIT}" "pea3nut/pxer:${TRAVIS_TAG}"
    docker push "pea3nut/pxer:${TRAVIS_TAG}"
fi
