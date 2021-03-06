import discourseComputed from "discourse-common/utils/decorators";
import RestModel from "discourse/models/rest";
import Site from "discourse/models/site";
import { get } from "@ember/object";

const MentionableItem = RestModel.extend({
  @discourseComputed("id")
  searchContext(id) {
    return {
      type: "mentionable_item",
      id,
      mentionable_item: this,
    };
  },
});

MentionableItem.reopenClass({
  nameFor(item) {
    if (!item) {
      return "";
    }

    let result = "";

    const id = get(item, "id");
    const name = get(item, "name");

    return !name || name.trim().length === 0
      ? `${result}${id}-mentionable_item`
      : result + name;
  },

  list() {
    return Site.currentProp("mentionable_items");
  },

  _idMap() {
    return Site.currentProp("mentionable_items");
  },

  findById(id) {
    if (!id) {
      return;
    }
    return MentionableItem._idMap()[id];
  },

  findByIds(ids = []) {
    const mentionable_items = [];
    ids.forEach((id) => {
      const found = MentionableItem.findById(id);
      if (found) {
        mentionable_items.push(found);
      }
    });
    return mentionable_items;
  },

  search(term, opts) {
    let limit = 5;

    if (opts) {
      if (opts.limit === 0) {
        return [];
      } else if (opts.limit) {
        limit = opts.limit;
      }
    }

    const emptyTerm = term === "";

    if (!emptyTerm) {
      term = term.toLowerCase();
    }

    const mentionable_items = MentionableItem.list();
    const length = mentionable_items.length;
    let i;
    let data = [];

    const done = () => {
      return data.length === limit;
    };

    for (i = 0; i < length && !done(); i++) {
      const mentionable_item = mentionable_items[i];

      if (
        (!emptyTerm &&
          mentionable_item.name.toLowerCase().indexOf(term) >= 0) ||
        (mentionable_item.slug &&
          mentionable_item.slug.toLowerCase().indexOf(term) >= 0)
      ) {
        data.push(mentionable_item);
      }
    }
    return data.sortBy("slug");
  },
});

export default MentionableItem;
