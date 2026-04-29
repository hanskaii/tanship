// @ts-ignore - collections will be generated
import { changelog as changelogCollection } from "collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
	baseUrl: "/changelog",
	source: changelogCollection.toFumadocsSource()
});
