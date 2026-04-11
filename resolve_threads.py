import json
import subprocess
import os

query = """
query {
  repository(owner: "arcade-cabinet", name: "protocol-silent-night") {
    pullRequest(number: 178) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}
"""
result = subprocess.check_output(['gh', 'api', 'graphql', '-f', f'query={query}']).decode('utf-8')
data = json.loads(result)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']

for thread in threads:
    if not thread['isResolved']:
        tid = thread['id']
        mutation = f'mutation {{ resolveReviewThread(input: {{threadId: "{tid}"}}) {{ clientMutationId }} }}'
        subprocess.run(['gh', 'api', 'graphql', '-f', f'query={mutation}'])

