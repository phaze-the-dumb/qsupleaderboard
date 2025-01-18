import { Accessor, createEffect, For, Setter, Show } from "solid-js";
import { User } from "./User";

let UserPopup = ( props: { user: Accessor<User | null>, setUser: Setter<User | null>, pos: Accessor<{ x: number, y: number }> }, ) => {
  let wordsContainer: HTMLDivElement;

  createEffect(() => {
    let words = props.user()?.words;
    if(!words)return;

    let sortedWords = words.sort(( a, b ) => b.uses - a.uses);
    console.log(sortedWords);

    wordsContainer!.innerHTML = "";
    wordsContainer!.appendChild(
      <div class="user-popup-info-words">
        <For each={sortedWords}>
          { ( word ) =>
            <div class="user-popup-info-word">
              "{ word.word }"<br />
              <div class="user-popup-info-word-uses">{ word.uses } Uses</div>
            </div>
          }
        </For>
      </div> as HTMLElement
    );
  })

  return (
    <Show when={props.user() !== null}>
      <div class="user-popup" style={{ top: props.pos().y + 'px', left: props.pos().x + 'px' }}>
        <div class="user-popup-close" onClick={() => props.setUser(null)}>x</div>
        <div class="user-popup-background" style={{ top: props.pos().y + 2.5 + 'px', left: props.pos().x + 2.5 + 'px', background: 'url(\'https://cdn.discordapp.com/avatars/' + props.user()?._id + '/' + props.user()?.avatar + '.webp?size=1024\')' }}></div>
        <div class="user-popup-account">
          <div class="user-popup-account-image" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + props.user()?._id + '/' + props.user()?.avatar + '.webp?size=128\')' }}></div>
          <div class="user-popup-account-name">{ props.user()?.username }</div>
        </div>
        <div class="user-popup-info">
          Most used words:
          <div ref={wordsContainer!}></div>
        </div>
      </div>
    </Show>
  )
}

export default UserPopup;