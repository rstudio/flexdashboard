
HTML_FILES := $(patsubst %.Rmd, %.html ,$(wildcard *.Rmd))

all: clean html

html: $(HTML_FILES)

%.html: %.Rmd
	R --slave -e "set.seed(100);rmarkdown::render('$<')"

.PHONY: clean
clean:
	$(RM) $(HTML_FILES)

