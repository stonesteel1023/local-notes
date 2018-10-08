import { NOTE_FRAGMENT } from "./fragments";
import { GET_NOTES } from "./sharedQueries";
import { saveNotes, restoreNotes } from "./offline";

export const defaults = {
  notes: restoreNotes()
};
export const resolvers = {
  Query: {
    note: (_, variables, { cache, getCacheKey }) => {
      const id = getCacheKey({ __typename: "Note", id: variables.id });
      const note = cache.readFragment({ fragment: NOTE_FRAGMENT, id });
      return note;
    }
  },
  Mutation: {
    addNote: (_, { title, content }, { cache }) => {
      const { notes } = cache.readQuery({ query: GET_NOTES });
      const newNote = {
        __typename: "Note",
        title,
        content,
        id: notes.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      cache.writeData({
        data: {
          notes: [newNote, ...notes]
        }
      });
      saveNotes(cache);
      return null;
    },
    updateNote: (_, { title, content, id }, { cache, getCacheKey }) => {
      const noteId = getCacheKey({ __typename: "Note", id });
      const note = cache.readFragment({ fragment: NOTE_FRAGMENT, id: noteId });
      cache.writeFragment({
        id: noteId,
        fragment: NOTE_FRAGMENT,
        data: {
          ...note,
          title,
          content,
          updatedAt: Date.now()
        }
      });
      saveNotes(cache);
      return null;
    }
  }
};

export const typeDefs = [
  `
    schema { 
        query: Query
        mutation: Mutation
    }
    type Query {
        notes: [Note]!
        note(id: Int!): Note
    }
    type Mutation {
      addNote(title:String!, content:String!)
    }
    type Note{
        id: Int!
        title: String!
        content: String!
        createdAt: Int!
        updatedAt: Int!
    }
`
];
