# python
# >>> import os
# >>> for filename in os.listdir("."):
# ...  if filename.startswith("cheese_"):
# ...    os.rename(filename, filename[7:])
import os
# print os.getcwd()
# print os.listdir(".")
os.chdir("C:/Users/rana/Downloads/Dev/Nanodegree - Mobile Web Specialist Scholarship/mws-restaurant-stage-1/img_600")
print os.getcwd()
print os.listdir(".")
for filename in os.listdir("."):
    os.rename(filename,filename.replace("-600",""))
print os.listdir(".")
