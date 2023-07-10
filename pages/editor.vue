<script setup lang="ts">
type Song = {
  _id: string;
  title: string;
  artist: string;
  sheet: string[];
  _artist: {
    thaiName: string;
    engName: string;
  };
  params: {
    key: string;
    ost: string;
    capo: number;
  };
} | null;

const route = useRoute();

const result = ref(null as Song);
const isPreview = ref(false);
const previewSheet = ref([] as string[]);

const onFetch = async () => {
  const song = await fetch(`/api/songs/${route.query.id}`);

  const songJson = (await song.json()).data;
  result.value = songJson;
};

onMounted(async () => {
  onFetch();
});

const onPreview = () => {
  previewSheet.value = formatter(result.value?.sheet as [string]);
  isPreview.value = !isPreview.value;
};

const formatter = (sheet: [string]) => {
  let newSheet = [] as string[];

  sheet.forEach((element) => {
    if (
      element.includes("INTRO") ||
      element.includes("INSTRUC") ||
      element.includes("INSTRU")
    ) {
      element = element.replaceAll("[", "").replaceAll("]", "");
    } else {
      element = element
        .replaceAll("][", "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replaceAll("[", "<span class='chord'><span class='inner'>")
        .replaceAll("]", "</span></span>");
    }
    newSheet.push(element);
  });

  return newSheet;
};
</script>

<template>
  <div v-if="result" class="flex flex-col px-16 my-12">
    <div class="text-2xl">{{ result.title }}</div>
    <div>
      {{ result._artist.thaiName || result._artist.engName }}
    </div>
    <div class="mt-2 text-right">
      <button
        v-if="!isPreview"
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black mr-2"
        @click="onPreview"
      >
        Preview
      </button>
      <button
        v-else
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black mr-2"
        @click="() => (isPreview = !isPreview)"
      >
        Edit
      </button>
      <button
        class="px-4 py-2 hover:bg-black hover:text-white border-2 border-black"
        @click=""
      >
        Submit
      </button>
    </div>
    <textarea
      v-if="!isPreview"
      class="mt-2 p-4 border-2 border-black resize-none font-mono whitespace-nowrap"
      name="editor"
      id="editor"
      rows="20"
      :value="result.sheet.join('\n')"
    ></textarea>
    <ul v-else class="mt-6 font-mono">
      <li v-for="(line, index) in previewSheet" :key="index">
        <div class="mb-4" v-html="line"></div>
      </li>
    </ul>
  </div>
</template>

<style>
.chord {
  position: absolute;
}

.chord .inner {
  position: relative;
  top: -1.25em;
  font-family: "Roboto Mono", monospace;
}
</style>
