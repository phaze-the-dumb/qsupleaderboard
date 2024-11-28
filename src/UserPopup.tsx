import { Accessor, createEffect } from "solid-js";
import { User } from "./User";

let UserPopup = ( props: { user: Accessor<User | null> } ) => {
  // let sortedWords = [];

  createEffect(() => {
    let words = props.user()?.words;
    if(!words)return;

    // sortedWords = words.sort(( a, b ) => b.uses - a.uses);


  })

  return (
    <div class="user-popup" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + props.user()?._id + '/' + props.user()?.avatar + '.webp?size=1024\')' }}>
      <div class="user-popup-background" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + props.user()?._id + '/' + props.user()?.avatar + '.webp?size=1024\')' }}></div>
      <div class="user-popup-account">
        <div class="user-popup-account-image" style={{ background: 'url(\'https://cdn.discordapp.com/avatars/' + props.user()?._id + '/' + props.user()?.avatar + '.webp?size=128\')' }}></div>
        <div class="user-popup-account-name">{ props.user()?.username }</div>
      </div>
      <div class="user-popup-info">
        Most used words:
        <div class="user-popup-info-words">
          <div class="user-popup-info-word">
            Fuck
            <div class="user-popup-info-word-uses">0 Uses</div>
          </div>
          <div class="user-popup-info-word">
            Shit
            <div class="user-popup-info-word-uses">0 Uses</div>
          </div>
          <div class="user-popup-info-word">
            Still
            <div class="user-popup-info-word-uses">0 Uses</div>
          </div>
          <div class="user-popup-info-word">
            Loading
            <div class="user-popup-info-word-uses">0 Uses</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPopup;