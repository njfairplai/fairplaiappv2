import { redirect } from 'next/navigation'

/**
 * Tester shortcut: typing /user-testing into the URL skips the palette
 * voting flow and lands directly on the persona gate. Repeat testers who
 * already voted on the palette can use this URL to jump straight to the
 * tour. The palette voting itself lives at `/`.
 */
export default function UserTestingShortcut() {
  redirect('/demo/persona')
}
