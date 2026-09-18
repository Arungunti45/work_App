# INCIDENT RESPONSE

## Incident Severities

| Level | Name | Description | Response Time | Action |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | Critical Blocker | Entire application down, severe security breach, or payment duplication loop. | Immediate (24/7) | Execute Frontend/Functions Rollback immediately. Restrict public access if data is bleeding. |
| **P1** | High | Core workflow (e.g. Job Application, Login, Webhook Processing) is broken. | < 1 Hour | Deploy hotfix. Do not wait for standard sprint cycles. |
| **P2** | Medium | Significant UX bugs or localized failure (e.g. Chat failing for one edge case). | < 24 Hours | Queue in next daily deployment. |
| **P3** | Low | Visual glitch, typo, or minor copy issue. | Next Sprint | Address during standard development. |

## Incident Handling Workflow
1. **Identify**: Monitor flags an issue or Customer Support escalates a P0/P1.
2. **Triaging**: Tech Lead confirms severity.
3. **Containment**: If data is bleeding, roll back or disable the feature flag.
4. **Resolution**: Develop patch locally -> Deploy to Staging -> Verify -> Deploy to Prod.
5. **Post-Mortem**: Required for all P0/P1 incidents within 48 hours to document root cause and prevention strategy.
