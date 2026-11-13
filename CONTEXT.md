# Profile context

Edward's public professional profile is moving to https://profile.edsong.xyz at his explicit request. The client-facing contact site takes over https://edsong.xyz in edwardsong08/contact-edsong. This is a domain migration, not a profile redesign.

The release checkout was created from the deployed origin/master revision 08de3717221dc965c0b2d60cb55030ef370ffedc. The original final-profile checkout has unrelated tracked/untracked drafts and local commits; preserve them. Push only the isolated migration commit to origin/master.

Hosting remains personal Coolify / Edward Song / production / final-profile-coolify, application j8cyflijvvyp6pq8rd0vs8xe. The profile has a new HTTPS domain binding and a proxied A record at profile pointing to the same personal server as contact. The existing edsong.xyz and www.edsong.xyz Cloudflare Tunnel routes are handed to the contact app only after the profile is reachable at its new address. Keep unrelated tunnel routes intact. See docs/deployment.md.

Canonical/Open Graph/JSON-LD URLs and the static sitemap/robots file now use profile.edsong.xyz. Relative profile links, the existing contact API, and the noreply@edsong.xyz sender remain. Resend credentials stay in the host configuration; no credential was copied into this checkout.

The TROA map's frame-ancestor and parent-message checks must allow https://profile.edsong.xyz. The Hub's public Profile Site link also moves to the new address. These are narrow dependency updates; private map behavior and the Hub's other services remain unchanged.
