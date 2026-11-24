# Updating the upstream version

Upstream is the `ghcr.io/mhsanaei/3x-ui` image, built by [MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui) for every `v*` release tag.

## Determining the upstream version

The pin is `images['x-ui'].source.dockerTag` in `startos/manifest/index.ts`. Find the latest stable release, skipping the `dev-latest` prerelease:

```bash
gh release list -R MHSanaei/3x-ui --exclude-pre-releases --limit 1
```

Confirm the tag is published for both architectures:

```bash
docker manifest inspect ghcr.io/mhsanaei/3x-ui:<tag> \
  | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Set `dockerTag` to `ghcr.io/mhsanaei/3x-ui:<tag>`. Image tags keep the `v` prefix.
2. Set `version` in `startos/versions/current.ts` to the tag without the `v`, followed by `:0`.
3. Check that the settings this package relies on still exist under the same names in `internal/web/service/setting.go`: `trustedProxyCIDRs`, `subURI`, `subPath`. Also check the `x-ui setting` flags it calls: `-username`, `-password`, `-resetTwoFactor`, `-getApiToken`, `-tokenName`, `-tokenScope`.
